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
import { RoommateRequestStatus } from '@prisma/client';

@Injectable()
export class RoommateRequestsService {
  private readonly logger = new Logger(RoommateRequestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Student sends a roommate request to another student.
   */
  async sendRequest(requesterId: string, targetId: string, hostelId: string) {
    if (requesterId === targetId) {
      throw new BadRequestException('Cannot send a roommate request to yourself.');
    }

    // Verify target exists and is in the same hostel
    const target = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundException('Target student not found.');
    if (target.hostelId !== hostelId) {
      throw new ForbiddenException('Cannot send roommate request to a student in a different hostel.');
    }

    // Check for existing request (either direction)
    const existing = await this.prisma.roommateRequest.findFirst({
      where: {
        OR: [
          { requesterId, targetId, status: RoommateRequestStatus.PENDING },
          { requesterId: targetId, targetId: requesterId, status: RoommateRequestStatus.PENDING },
        ],
      },
    });
    if (existing) {
      throw new ConflictException('A roommate request already exists between you and this student.');
    }

    try {
      const request = await this.prisma.roommateRequest.create({
        data: {
          requesterId,
          targetId,
          status: RoommateRequestStatus.PENDING,
        },
        include: {
          target: { select: { id: true, email: true, profile: true } },
        },
      });

      await this.auditService.log({
        action: 'ROOMMATE_REQUEST_SENT',
        newValue: { requesterId, targetId },
        hostelId,
        userId: requesterId,
      });

      return request;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Roommate request already exists.');
      }
      this.logger.error('Roommate request error', error?.stack);
      throw new InternalServerErrorException('Failed to send roommate request.');
    }
  }

  /**
   * Get all roommate requests for a student (sent + received).
   */
  async getMyRequests(studentId: string) {
    const sent = await this.prisma.roommateRequest.findMany({
      where: { requesterId: studentId },
      include: {
        target: { select: { id: true, email: true, profile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const received = await this.prisma.roommateRequest.findMany({
      where: { targetId: studentId },
      include: {
        requester: { select: { id: true, email: true, profile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { sent, received };
  }

  /**
   * Target student accepts a roommate request.
   */
  async acceptRequest(requestId: string, studentId: string, hostelId: string) {
    const request = await this.prisma.roommateRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Roommate request not found.');
    if (request.targetId !== studentId) throw new ForbiddenException('Not your request to accept.');
    if (request.status !== RoommateRequestStatus.PENDING) {
      throw new BadRequestException('This request is no longer pending.');
    }

    const updated = await this.prisma.roommateRequest.update({
      where: { id: requestId },
      data: { status: RoommateRequestStatus.ACCEPTED, respondedAt: new Date() },
    });

    await this.auditService.log({
      action: 'ROOMMATE_REQUEST_ACCEPTED',
      newValue: { requestId },
      hostelId,
      userId: studentId,
    });

    return updated;
  }

  /**
   * Target student rejects a roommate request.
   */
  async rejectRequest(requestId: string, studentId: string, hostelId: string) {
    const request = await this.prisma.roommateRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Roommate request not found.');
    if (request.targetId !== studentId) throw new ForbiddenException('Not your request to reject.');
    if (request.status !== RoommateRequestStatus.PENDING) {
      throw new BadRequestException('This request is no longer pending.');
    }

    const updated = await this.prisma.roommateRequest.update({
      where: { id: requestId },
      data: { status: RoommateRequestStatus.REJECTED, respondedAt: new Date() },
    });

    await this.auditService.log({
      action: 'ROOMMATE_REQUEST_REJECTED',
      newValue: { requestId },
      hostelId,
      userId: studentId,
    });

    return updated;
  }

  /**
   * Cancel a sent roommate request.
   */
  async cancelRequest(requestId: string, studentId: string, hostelId: string) {
    const request = await this.prisma.roommateRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Roommate request not found.');
    if (request.requesterId !== studentId) throw new ForbiddenException('Not your request to cancel.');
    if (request.status !== RoommateRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be cancelled.');
    }

    return this.prisma.roommateRequest.update({
      where: { id: requestId },
      data: { status: RoommateRequestStatus.CANCELLED, respondedAt: new Date() },
    });
  }
}
