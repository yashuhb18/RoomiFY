import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AllocationStatus, RoomStatus } from '@prisma/client';

@Injectable()
export class AllocationsService {
  private readonly logger = new Logger(AllocationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Student's current active allocation with room, bed, and roommate info.
   */
  async getMyAllocation(studentId: string) {
    const allocation = await this.prisma.allocation.findFirst({
      where: {
        studentId,
        status: { in: [AllocationStatus.ALLOCATED, AllocationStatus.CHECKED_IN] },
      },
      include: {
        room: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            beds: {
              include: {
                allocations: {
                  where: { status: { in: [AllocationStatus.ALLOCATED, AllocationStatus.CHECKED_IN] } },
                  include: {
                    student: {
                      select: { id: true, email: true, profile: true },
                    },
                  },
                  take: 1,
                },
              },
              orderBy: { bedNumber: 'asc' },
            },
          },
        },
        bed: true,
        hostel: { select: { id: true, name: true } },
      },
    });

    return allocation;
  }

  /**
   * Get all allocations for warden's hostel.
   */
  async findByHostel(hostelId: string) {
    return this.prisma.allocation.findMany({
      where: { hostelId },
      include: {
        student: { select: { id: true, email: true, profile: true } },
        room: { select: { id: true, roomNumber: true, floor: true } },
        bed: { select: { id: true, bedNumber: true, label: true } },
      },
      orderBy: { allocatedAt: 'desc' },
    });
  }

  /**
   * Warden checks in a student.
   */
  async checkIn(allocationId: string, wardenId: string, hostelId: string) {
    const allocation = await this.prisma.allocation.findUnique({ where: { id: allocationId } });
    if (!allocation) throw new NotFoundException('Allocation not found.');
    if (allocation.hostelId !== hostelId) throw new ForbiddenException('Not your hostel.');
    if (allocation.status !== AllocationStatus.ALLOCATED) {
      throw new BadRequestException('Only allocated entries can be checked in.');
    }

    const updated = await this.prisma.allocation.update({
      where: { id: allocationId },
      data: { status: AllocationStatus.CHECKED_IN, checkedInAt: new Date() },
    });

    await this.auditService.log({
      action: 'ALLOCATION_CHECKED_IN',
      newValue: { allocationId, studentId: allocation.studentId },
      hostelId,
      userId: wardenId,
    });

    return updated;
  }

  /**
   * Warden checks out a student — releases bed and updates room occupancy.
   */
  async checkOut(allocationId: string, wardenId: string, hostelId: string, releaseReason?: string) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const allocation = await tx.allocation.findUnique({
          where: { id: allocationId },
          include: { room: true },
        });
        if (!allocation) throw new NotFoundException('Allocation not found.');
        if (allocation.hostelId !== hostelId) throw new ForbiddenException('Not your hostel.');
        if (allocation.status !== AllocationStatus.CHECKED_IN && allocation.status !== AllocationStatus.ALLOCATED) {
          throw new BadRequestException('Only active allocations can be checked out.');
        }

        // Update allocation
        const updated = await tx.allocation.update({
          where: { id: allocationId },
          data: {
            status: AllocationStatus.CHECKED_OUT,
            checkedOutAt: new Date(),
            releasedAt: new Date(),
            releaseReason: releaseReason || 'Checkout',
          },
        });

        // Release bed
        if (allocation.bedId) {
          await tx.bed.update({
            where: { id: allocation.bedId },
            data: { isAvailable: true },
          });
        }

        // Decrement room occupancy
        const newOccupancy = Math.max(0, allocation.room.currentOccupancy - 1);
        const newStatus = newOccupancy === 0 ? RoomStatus.AVAILABLE : RoomStatus.PARTIALLY_OCCUPIED;

        await tx.room.update({
          where: { id: allocation.roomId },
          data: { currentOccupancy: newOccupancy, status: newStatus },
        });

        return updated;
      });

      await this.auditService.log({
        action: 'ALLOCATION_CHECKED_OUT',
        newValue: { allocationId, releaseReason },
        hostelId,
        userId: wardenId,
      });

      return result;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) throw error;
      this.logger.error('Checkout error', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to check out.');
    }
  }

  /**
   * Student requests a transfer.
   */
  async requestTransfer(allocationId: string, studentId: string) {
    const allocation = await this.prisma.allocation.findUnique({ where: { id: allocationId } });
    if (!allocation) throw new NotFoundException('Allocation not found.');
    if (allocation.studentId !== studentId) throw new ForbiddenException('Not your allocation.');
    if (allocation.status !== AllocationStatus.CHECKED_IN && allocation.status !== AllocationStatus.ALLOCATED) {
      throw new BadRequestException('Only active allocations can request transfer.');
    }

    return this.prisma.allocation.update({
      where: { id: allocationId },
      data: { status: AllocationStatus.TRANSFER_REQUESTED },
    });
  }

  /**
   * Warden approves a transfer — releases old bed, assigns new bed.
   */
  async approveTransfer(
    allocationId: string,
    newRoomId: string,
    newBedId: string,
    wardenId: string,
    hostelId: string,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const oldAllocation = await tx.allocation.findUnique({
          where: { id: allocationId },
          include: { room: true },
        });
        if (!oldAllocation) throw new NotFoundException('Allocation not found.');
        if (oldAllocation.status !== AllocationStatus.TRANSFER_REQUESTED) {
          throw new BadRequestException('Allocation is not in transfer-requested state.');
        }

        // Release old bed
        if (oldAllocation.bedId) {
          await tx.bed.update({ where: { id: oldAllocation.bedId }, data: { isAvailable: true } });
        }

        // Decrement old room occupancy
        const oldNewOccupancy = Math.max(0, oldAllocation.room.currentOccupancy - 1);
        await tx.room.update({
          where: { id: oldAllocation.roomId },
          data: {
            currentOccupancy: oldNewOccupancy,
            status: oldNewOccupancy === 0 ? RoomStatus.AVAILABLE : RoomStatus.PARTIALLY_OCCUPIED,
          },
        });

        // Mark old allocation as transferred
        await tx.allocation.update({
          where: { id: allocationId },
          data: { status: AllocationStatus.TRANSFERRED, releasedAt: new Date(), releaseReason: 'Transfer approved' },
        });

        // Verify new bed
        const newBed = await tx.bed.findUnique({ where: { id: newBedId } });
        if (!newBed || !newBed.isAvailable) throw new ConflictException('New bed is not available.');

        // Lock new room
        const newRooms = await tx.$queryRaw<Array<{ id: string; capacity: number; currentOccupancy: number }>>`
          SELECT id, capacity, "currentOccupancy" FROM rooms WHERE id = ${newRoomId} FOR UPDATE
        `;
        if (newRooms.length === 0) throw new NotFoundException('New room not found.');
        const newRoom = newRooms[0];
        if (newRoom.currentOccupancy >= newRoom.capacity) throw new ConflictException('New room is full.');

        // Create new allocation
        const newAllocation = await tx.allocation.create({
          data: {
            studentId: oldAllocation.studentId,
            roomId: newRoomId,
            bedId: newBedId,
            hostelId,
            allocatedById: wardenId,
            status: AllocationStatus.ALLOCATED,
          },
        });

        // Mark new bed occupied
        await tx.bed.update({ where: { id: newBedId }, data: { isAvailable: false } });

        // Increment new room occupancy
        const newOcc = newRoom.currentOccupancy + 1;
        await tx.room.update({
          where: { id: newRoomId },
          data: {
            currentOccupancy: newOcc,
            status: newOcc >= newRoom.capacity ? RoomStatus.FULL : RoomStatus.PARTIALLY_OCCUPIED,
          },
        });

        return newAllocation;
      }, { isolationLevel: 'Serializable', maxWait: 5000, timeout: 10000 });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof ConflictException
      ) throw error;
      this.logger.error('Transfer error', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to process transfer.');
    }
  }
}
