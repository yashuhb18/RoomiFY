import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { TicketsRepository } from './tickets.repository';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AuditService } from '../audit/audit.service';
import { TicketStatus } from '@prisma/client';

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
      const thresholdHours = SLA_THRESHOLDS[categoryLower] || SLA_THRESHOLDS['other'];

      // Calculate SLA deadline
      const slaDeadline = new Date();
      slaDeadline.setHours(slaDeadline.getHours() + thresholdHours);

      // Predict breach risk
      let breachRisk = false;
      const avgResolutionTime =
        await this.ticketsRepository.getAverageResolutionTime(
          hostelId,
          dto.category,
        );

      if (avgResolutionTime !== null && avgResolutionTime > thresholdHours) {
        breachRisk = true;
      }

      const ticket = await this.ticketsRepository.create({
        category: dto.category,
        description: dto.description,
        photoUrl: dto.photoUrl,
        slaDeadline,
        breachRisk,
        hostelId,
        studentId,
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

      return ticket;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Error creating ticket', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to create ticket.');
    }
  }

  async findById(id: string) {
    try {
      const ticket = await this.ticketsRepository.findById(id);
      if (!ticket) throw new NotFoundException('Ticket not found.');
      return ticket;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
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

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error updating ticket', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to update ticket.');
    }
  }
}
