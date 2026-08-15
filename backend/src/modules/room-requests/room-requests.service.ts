import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateRoomRequestDto } from './dto/create-room-request.dto';
import { ApproveRoomRequestDto, RejectRoomRequestDto } from './dto/review-room-request.dto';
import { RequestStatus, AllocationStatus, RoomStatus } from '@prisma/client';

import { MailService } from '../mail/mail.service';

@Injectable()
export class RoomRequestsService {
  private readonly logger = new Logger(RoomRequestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Student creates a room request with full eligibility checks.
   */
  async createRequest(dto: CreateRoomRequestDto, studentId: string, hostelId: string) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Verify student profile is complete
        const student = await tx.user.findUnique({ where: { id: studentId } });
        if (!student || !student.isActive) {
          throw new BadRequestException('Student account is not active.');
        }

        // 2. Check student doesn't already have an active allocation
        const existingAllocation = await tx.allocation.findFirst({
          where: {
            studentId,
            status: { in: [AllocationStatus.ALLOCATED, AllocationStatus.CHECKED_IN] },
          },
        });
        if (existingAllocation) {
          throw new ConflictException('You already have an active room allocation. Request a transfer instead.');
        }

        // 3. Check student doesn't have a conflicting pending request
        const existingRequest = await tx.roomRequest.findFirst({
          where: {
            studentId,
            status: RequestStatus.PENDING,
          },
        });
        if (existingRequest) {
          throw new ConflictException('You already have a pending room request. Cancel it before submitting a new one.');
        }

        // 4. Lock and verify room availability
        const rooms = await tx.$queryRaw<
          Array<{ id: string; capacity: number; currentOccupancy: number; hostelId: string; status: string; condition: string }>
        >`
          SELECT id, capacity, "currentOccupancy", "hostelId", status::text, condition::text
          FROM rooms
          WHERE id = ${dto.roomId}
          FOR UPDATE
        `;

        if (rooms.length === 0) {
          throw new NotFoundException('Room not found.');
        }

        const room = rooms[0];

        // 5. Verify room belongs to student's hostel
        if (room.hostelId !== hostelId) {
          throw new ForbiddenException('Cannot request a room in a different hostel.');
        }

        // 6. Verify room is requestable
        if (room.status === 'UNDER_MAINTENANCE' || room.status === 'BLOCKED' || room.status === 'UNAVAILABLE') {
          throw new BadRequestException('This room is currently not available for requests.');
        }

        if (room.condition === 'UNDER_MAINTENANCE' || room.condition === 'UNAVAILABLE') {
          throw new BadRequestException('This room is currently under maintenance.');
        }

        // 7. Verify room has available capacity
        if (room.currentOccupancy >= room.capacity) {
          throw new ConflictException('This room is full.');
        }

        // 8. Create the room request
        const roomRequest = await tx.roomRequest.create({
          data: {
            studentId,
            roomId: dto.roomId,
            preferredBedId: dto.preferredBedId,
            notes: dto.notes,
            status: RequestStatus.PENDING,
          },
          include: {
            room: { select: { roomNumber: true, floor: true } },
          },
        });

        return roomRequest;
      }, {
        isolationLevel: 'Serializable',
        maxWait: 5000,
        timeout: 10000,
      });

      const student = await this.prisma.user.findUnique({ where: { id: studentId } });
      if (student) {
        const studentName = (student.profile as any)?.fullName || student.email.split('@')[0];
        this.mailService.sendRoomRequestSubmittedEmail(
          student.email,
          studentName,
          result.room.roomNumber,
          result.room.floor ?? 1,
          result.notes || undefined,
        ).catch(() => {});
      }

      return result;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) throw error;
      this.logger.error('Room request creation error', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to create room request.');
    }
  }

  /**
   * Student views their room requests.
   */
  async findByStudent(studentId: string) {
    return this.prisma.roomRequest.findMany({
      where: { studentId },
      include: {
        room: { select: { id: true, roomNumber: true, floor: true, capacity: true, currentOccupancy: true } },
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  /**
   * Warden views all pending requests for the hostel.
   */
  async findByHostel(hostelId: string, statusFilter?: RequestStatus) {
    return this.prisma.roomRequest.findMany({
      where: {
        room: { hostelId },
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      include: {
        student: { select: { id: true, email: true, profile: true } },
        room: {
          select: {
            id: true, roomNumber: true, floor: true, capacity: true, currentOccupancy: true, status: true,
            beds: { select: { id: true, bedNumber: true, label: true, isAvailable: true } },
          },
        },
      },
      orderBy: { requestedAt: 'asc' },
    });
  }

  /**
   * Student cancels a pending request.
   */
  async cancelRequest(requestId: string, studentId: string, hostelId: string) {
    const request = await this.prisma.roomRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Room request not found.');
    if (request.studentId !== studentId) throw new ForbiddenException('Not your request.');
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be cancelled.');
    }

    const updated = await this.prisma.roomRequest.update({
      where: { id: requestId },
      data: { status: RequestStatus.CANCELLED },
    });

    await this.auditService.log({
      action: 'ROOM_REQUEST_CANCELLED',
      oldValue: { status: RequestStatus.PENDING },
      newValue: { status: RequestStatus.CANCELLED },
      hostelId,
      userId: studentId,
    });

    return updated;
  }

  /**
   * Warden approves a room request — atomic allocation with double-booking protection.
   */
  async approveRequest(requestId: string, dto: ApproveRoomRequestDto, wardenId: string, hostelId: string) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Load and verify request
        const request = await tx.roomRequest.findUnique({
          where: { id: requestId },
          include: { room: true, student: true },
        });
        if (!request) throw new NotFoundException('Room request not found.');
        if (request.status !== RequestStatus.PENDING) {
          throw new BadRequestException('This request is no longer pending.');
        }

        // 2. Verify room belongs to warden's hostel
        if (request.room.hostelId !== hostelId) {
          throw new ForbiddenException('Cannot approve requests for rooms outside your hostel.');
        }

        // 3. Lock room and verify availability
        const rooms = await tx.$queryRaw<
          Array<{ id: string; capacity: number; currentOccupancy: number }>
        >`
          SELECT id, capacity, "currentOccupancy"
          FROM rooms
          WHERE id = ${request.roomId}
          FOR UPDATE
        `;

        if (rooms.length === 0) throw new NotFoundException('Room not found.');
        const room = rooms[0];

        if (room.currentOccupancy >= room.capacity) {
          throw new ConflictException('Room is now full. Cannot approve this request.');
        }

        // 4. Verify or auto-create available bed
        let bed: any = null;
        if (dto.bedId && dto.bedId !== 'AUTO_BED') {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.bedId);
          if (isUuid) {
            bed = await tx.bed.findUnique({ where: { id: dto.bedId } });
          }
        }
        if (!bed) {
          bed = await tx.bed.findFirst({
            where: { roomId: request.roomId, isAvailable: true },
          });
        }
        if (!bed) {
          const bedCount = await tx.bed.count({ where: { roomId: request.roomId } });
          bed = await tx.bed.create({
            data: {
              roomId: request.roomId,
              bedNumber: bedCount + 1,
              label: `Bed ${bedCount + 1}`,
              isAvailable: true,
            },
          });
        }

        if (!bed.isAvailable) {
          throw new ConflictException('This bed is already occupied.');
        }

        // 5. Verify student doesn't already have an active allocation
        const existingAllocation = await tx.allocation.findFirst({
          where: {
            studentId: request.studentId,
            status: { in: [AllocationStatus.ALLOCATED, AllocationStatus.CHECKED_IN] },
          },
        });
        if (existingAllocation) {
          throw new ConflictException('Student already has an active allocation.');
        }

        // 6. Create allocation
        const allocation = await tx.allocation.create({
          data: {
            studentId: request.studentId,
            roomId: request.roomId,
            bedId: bed.id,
            hostelId,
            allocatedById: wardenId,
            status: AllocationStatus.ALLOCATED,
          },
        });

        // 7. Mark bed as occupied
        await tx.bed.update({
          where: { id: bed.id },
          data: { isAvailable: false },
        });

        // 8. Increment room occupancy and recalculate status
        const newOccupancy = room.currentOccupancy + 1;
        const newStatus = newOccupancy >= room.capacity ? RoomStatus.FULL : RoomStatus.PARTIALLY_OCCUPIED;

        await tx.room.update({
          where: { id: request.roomId },
          data: {
            currentOccupancy: newOccupancy,
            status: newStatus,
          },
        });

        // 9. Update request status
        await tx.roomRequest.update({
          where: { id: requestId },
          data: {
            status: RequestStatus.APPROVED,
            reviewedById: wardenId,
            reviewedAt: new Date(),
          },
        });

        return allocation;
      }, {
        isolationLevel: 'Serializable',
        maxWait: 5000,
        timeout: 10000,
      });

      const student = await this.prisma.user.findUnique({ where: { id: result.studentId } });
      const room = await this.prisma.room.findUnique({ where: { id: result.roomId } });
      const bed = result.bedId ? await this.prisma.bed.findUnique({ where: { id: result.bedId } }) : null;
      if (student && room && bed) {
        const studentName = (student.profile as any)?.fullName || student.email.split('@')[0];
        this.mailService.sendRoomAllocatedEmail(
          student.email,
          studentName,
          room.roomNumber,
          room.floor ?? 1,
          bed.label || `Bed ${bed.bedNumber}`,
        ).catch(() => {});
      }

      return result;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) throw error;
      this.logger.error('Room request approval error', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to approve room request.');
    }
  }

  /**
   * Warden rejects a room request.
   */
  async rejectRequest(requestId: string, dto: RejectRoomRequestDto, wardenId: string, hostelId: string) {
    const request = await this.prisma.roomRequest.findUnique({
      where: { id: requestId },
      include: { room: true },
    });
    if (!request) throw new NotFoundException('Room request not found.');
    if (request.room.hostelId !== hostelId) throw new ForbiddenException('Not your hostel.');
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('This request is no longer pending.');
    }

    const updated = await this.prisma.roomRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.REJECTED,
        rejectionReason: dto.rejectionReason,
        reviewedById: wardenId,
        reviewedAt: new Date(),
      },
    });

    await this.auditService.log({
      action: 'ROOM_REQUEST_REJECTED',
      newValue: { requestId, reason: dto.rejectionReason },
      hostelId,
      userId: wardenId,
    });

    return updated;
  }
}
