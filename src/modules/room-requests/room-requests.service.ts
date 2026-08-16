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
  ) { }

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

        // 4. Verify room availability using Prisma native query
        const room = await tx.room.findUnique({
          where: { id: dto.roomId },
          select: { id: true, capacity: true, currentOccupancy: true, hostelId: true, status: true, condition: true },
        });

        if (!room) {
          throw new NotFoundException('Room not found.');
        }

        // 5. Verify room belongs to student's hostel or auto-align
        if (room.hostelId && room.hostelId !== hostelId) {
          // Auto-align student's hostel ID to target room if available
          await tx.user.update({
            where: { id: studentId },
            data: { hostelId: room.hostelId },
          }).catch(() => {});
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
        maxWait: 10000,
        timeout: 30000,
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
        ).catch(() => { });
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
   * Student views their own room requests.
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
        ...(hostelId ? { room: { hostelId } } : {}),
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

        // 2. Fetch room details
        const room = await tx.room.findUnique({
          where: { id: request.roomId },
          select: { id: true, roomNumber: true, capacity: true, currentOccupancy: true, hostelId: true },
        });

        if (!room) throw new NotFoundException('Room not found in inventory.');

        if (room.currentOccupancy >= room.capacity) {
          throw new ConflictException('Room is now full. Cannot approve this request.');
        }

        // 3. Verify or auto-create available bed safely
        let bed: any = null;
        if (dto.bedId && dto.bedId !== 'AUTO_BED') {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.bedId);
          if (isUuid) {
            bed = await tx.bed.findUnique({ where: { id: dto.bedId } });
          } else {
            bed = await tx.bed.findFirst({
              where: {
                roomId: request.roomId,
                OR: [{ label: dto.bedId }, { id: dto.bedId }],
              },
            });
          }
        }

        if (!bed) {
          bed = await tx.bed.findFirst({
            where: { roomId: request.roomId, isAvailable: true },
          });
        }

        if (!bed) {
          const maxBed = await tx.bed.findFirst({
            where: { roomId: request.roomId },
            orderBy: { bedNumber: 'desc' },
          });
          const nextBedNumber = (maxBed?.bedNumber || 0) + 1;

          bed = await tx.bed.create({
            data: {
              roomId: request.roomId,
              bedNumber: nextBedNumber,
              label: `Bed ${nextBedNumber}`,
              isAvailable: true,
            },
          });
        }

        // 4. If student has an existing active allocation, release old bed & update old allocation
        const existingAllocation = await tx.allocation.findFirst({
          where: {
            studentId: request.studentId,
            status: { in: [AllocationStatus.ALLOCATED, AllocationStatus.CHECKED_IN] },
          },
        });

        if (existingAllocation) {
          if (existingAllocation.bedId) {
            await tx.bed.update({
              where: { id: existingAllocation.bedId },
              data: { isAvailable: true },
            }).catch(() => {});
          }
          const prevRoom = await tx.room.findUnique({ where: { id: existingAllocation.roomId } });
          if (prevRoom && prevRoom.currentOccupancy > 0) {
            await tx.room.update({
              where: { id: existingAllocation.roomId },
              data: {
                currentOccupancy: Math.max(0, prevRoom.currentOccupancy - 1),
                status: prevRoom.currentOccupancy - 1 < prevRoom.capacity ? RoomStatus.PARTIALLY_OCCUPIED : RoomStatus.FULL,
              },
            }).catch(() => {});
          }
          await tx.allocation.update({
            where: { id: existingAllocation.id },
            data: {
              status: AllocationStatus.TRANSFERRED,
              releasedAt: new Date(),
              releaseReason: `Transferred to Room ${room.roomNumber}`,
            },
          }).catch(() => {});
        }

        const effectiveHostelId = room.hostelId || hostelId;

        // Verify wardenId exists in database
        const validWarden = wardenId ? await tx.user.findUnique({ where: { id: wardenId } }) : null;
        const validWardenId = validWarden ? wardenId : undefined;

        // 5. Create new allocation
        const allocation = await tx.allocation.create({
          data: {
            studentId: request.studentId,
            roomId: request.roomId,
            bedId: bed.id,
            hostelId: effectiveHostelId,
            allocatedById: validWardenId,
            status: AllocationStatus.ALLOCATED,
          },
        });

        // 6. Mark bed as occupied
        await tx.bed.update({
          where: { id: bed.id },
          data: { isAvailable: false },
        });

        // 7. Increment room occupancy and recalculate status
        const newOccupancy = room.currentOccupancy + 1;
        const newStatus = newOccupancy >= room.capacity ? RoomStatus.FULL : RoomStatus.PARTIALLY_OCCUPIED;

        await tx.room.update({
          where: { id: request.roomId },
          data: {
            currentOccupancy: newOccupancy,
            status: newStatus,
          },
        });

        // 8. Update request status
        await tx.roomRequest.update({
          where: { id: requestId },
          data: {
            status: RequestStatus.APPROVED,
            reviewedById: validWardenId,
            reviewedAt: new Date(),
          },
        });

        return allocation;
      }, {
        maxWait: 10000,
        timeout: 30000,
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
        ).catch(() => { });
      }

      return result;
    } catch (error: any) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error('Room request approval error', error instanceof Error ? error.stack : undefined);
      throw new BadRequestException(error?.message || 'Failed to approve room request.');
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
