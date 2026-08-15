import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtPayload } from '../../common/decorators';
import { TicketsRepository } from './tickets.repository';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketStatus, Role } from '@prisma/client';

// SLA thresholds in hours per category
const SLA_THRESHOLDS: Record<string, number> = {
  plumbing: 24,
  electrical: 12,
  cleaning: 6,
  carpentry: 24,
  appliance: 18,
  internet: 8,
  security: 4,
  other: 24,
};

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly ticketsRepository: TicketsRepository,
    private readonly auditService: AuditService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * SLA Breach Prediction on ticket creation:
   * 1. Query avg resolution time for category (last 30 days, RESOLVED tickets)
   * 2. Compare against SLA threshold
   * 3. If avgResolutionTime > threshold → breachRisk = true
   * 4. slaDeadline = now + threshold hours
   */
  async create(
    dto: CreateTicketDto,
    studentId: string,
    hostelId: string,
  ) {
    try {
      const categoryLower = dto.category.toLowerCase().trim();
      const targetStudentId = dto.studentId || studentId;
      const isDisciplinary = categoryLower.includes('disciplinary') || categoryLower.includes('rule');
      const thresholdHours = isDisciplinary ? 12 : (SLA_THRESHOLDS[categoryLower] || SLA_THRESHOLDS['other']);

      // Calculate SLA deadline
      const slaDeadline = new Date();
      slaDeadline.setHours(slaDeadline.getHours() + thresholdHours);

      // Predict breach risk (Disciplinary escalations are automatically flagged HIGH RISK)
      let breachRisk = isDisciplinary;
      if (!isDisciplinary) {
        const avgResolutionTime =
          await this.ticketsRepository.getAverageResolutionTime(
            hostelId,
            dto.category,
          );

        if (avgResolutionTime !== null && avgResolutionTime > thresholdHours) {
          breachRisk = true;
        }
      }

      const ticket = await this.ticketsRepository.create({
        category: dto.category,
        description: dto.description,
        photoUrl: dto.photoUrl,
        slaDeadline,
        breachRisk,
        hostelId,
        studentId: targetStudentId,
      });

      await this.auditService.log({
        action: 'TICKET_CREATED',
        newValue: {
          ticketId: ticket.id,
          category: ticket.category,
          breachRisk,
          slaDeadline: slaDeadline.toISOString(),
        },
        hostelId,
        userId: studentId,
      });

      // Send ticket-raised emails (fire-and-forget)
      const studentEmail = ticket.student?.email;
      if (studentEmail) {
        const studentProfile = await this.prisma.user.findUnique({
          where: { id: targetStudentId },
          select: { profile: true },
        });
        const studentName = (studentProfile?.profile as any)?.fullName || '';

        this.mailService.sendTicketRaisedEmail(
          studentEmail, studentName, ticket.id, ticket.category,
          dto.description, slaDeadline.toISOString(), breachRisk,
        ).catch(() => {});

        // Send warden alert
        const wardens = await this.prisma.user.findMany({
          where: { hostelId, role: { in: [Role.WARDEN, Role.SUPER_ADMIN] }, isActive: true },
          select: { email: true },
        });
        for (const warden of wardens) {
          this.mailService.sendTicketRaisedWardenAlert(
            warden.email, studentEmail, ticket.id, ticket.category,
            dto.description, slaDeadline.toISOString(), breachRisk,
          ).catch(() => {});
        }
      }

      return ticket;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Error creating ticket', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to create ticket.');
    }
  }

  async findById(id: string, user: JwtPayload) {
    try {
      const ticket = await this.ticketsRepository.findById(id);
      if (!ticket) throw new NotFoundException('Ticket not found.');

      // IDOR Protection Check
      if (user.role === 'STUDENT' && ticket.studentId !== user.sub) {
        throw new ForbiddenException('You do not have permission to view this ticket.');
      }
      if ((user.role === 'WARDEN' || user.role === 'STAFF') && ticket.hostelId !== user.hostelId) {
        throw new ForbiddenException('This ticket does not belong to your assigned hostel.');
      }

      return ticket;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) throw error;
      this.logger.error('Error fetching ticket', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to fetch ticket.');
    }
  }

  async findByHostel(hostelId: string) {
    try {
      return this.ticketsRepository.findByHostel(hostelId);
    } catch (error) {
      this.logger.error('Error fetching tickets', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to fetch tickets.');
    }
  }

  async findByStudent(studentId: string) {
    try {
      return this.ticketsRepository.findByStudent(studentId);
    } catch (error) {
      this.logger.error('Error fetching student tickets', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to fetch tickets.');
    }
  }

  async getBreachRisks(hostelId: string) {
    try {
      return this.ticketsRepository.findBreachRisks(hostelId);
    } catch (error) {
      this.logger.error('Error fetching breach risks', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to fetch breach risks.');
    }
  }

  async assignStaff(
    ticketId: string,
    staffId: string,
    hostelId: string,
    userId: string,
  ) {
    try {
      const ticket = await this.ticketsRepository.findById(ticketId);
      if (!ticket) throw new NotFoundException('Ticket not found.');

      // IDOR Protection Check
      if (ticket.hostelId !== hostelId) {
        throw new ForbiddenException('You can only assign staff to tickets in your assigned hostel.');
      }

      if (ticket.status === TicketStatus.RESOLVED) {
        throw new BadRequestException('Cannot assign staff to a resolved ticket.');
      }

      const updated = await this.ticketsRepository.assignStaff(ticketId, staffId);

      await this.auditService.log({
        action: 'TICKET_ASSIGNED',
        oldValue: { assignedTo: ticket.assignedTo },
        newValue: { assignedTo: staffId },
        hostelId,
        userId,
      });

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error('Error assigning staff', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to assign staff.');
    }
  }

  async updateStatus(
    ticketId: string,
    status: TicketStatus,
    hostelId: string,
    userId: string,
  ) {
    try {
      const ticket = await this.ticketsRepository.findById(ticketId);
      if (!ticket) throw new NotFoundException('Ticket not found.');

      // IDOR Protection Check
      if (ticket.hostelId !== hostelId) {
        throw new ForbiddenException('You can only update tickets in your assigned hostel.');
      }

      const additionalData: any = {};
      if (status === TicketStatus.RESOLVED) {
        additionalData.resolvedAt = new Date();
      }

      const updated = await this.ticketsRepository.updateStatus(
        ticketId,
        status,
        additionalData,
      );

      await this.auditService.log({
        action: 'TICKET_STATUS_UPDATED',
        oldValue: { status: ticket.status },
        newValue: { status },
        hostelId,
        userId,
      });

      // Send ticket-resolved email to student (fire-and-forget)
      if (status === TicketStatus.RESOLVED && ticket.studentId) {
        const student = await this.prisma.user.findUnique({
          where: { id: ticket.studentId },
          select: { email: true, profile: true },
        });
        if (student) {
          const studentName = (student.profile as any)?.fullName || '';
          this.mailService.sendTicketResolvedEmail(
            student.email, studentName, ticket.id, ticket.category,
          ).catch(() => {});
        }
      }

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error updating ticket', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to update ticket.');
    }
  }
}
