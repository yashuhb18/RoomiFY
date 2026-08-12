import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketStatus } from '@prisma/client';

@Injectable()
export class TicketsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    category: string;
    description: string;
    photoUrl?: string;
    slaDeadline: Date;
    breachRisk: boolean;
    hostelId: string;
    studentId: string;
  }) {
    return this.prisma.ticket.create({
      data,
      include: {
        student: { select: { id: true, email: true } },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.ticket.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, email: true } },
        assignedStaff: { select: { id: true, email: true } },
      },
    });
  }

  async findByHostel(hostelId: string) {
    return this.prisma.ticket.findMany({
      where: { hostelId },
      include: {
        student: { select: { id: true, email: true } },
        assignedStaff: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStudent(studentId: string) {
    return this.prisma.ticket.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBreachRisks(hostelId: string) {
    return this.prisma.ticket.findMany({
      where: {
        hostelId,
        breachRisk: true,
        status: { not: TicketStatus.RESOLVED },
      },
      include: {
        student: { select: { id: true, email: true } },
        assignedStaff: { select: { id: true, email: true } },
      },
      orderBy: { slaDeadline: 'asc' },
    });
  }

  async updateStatus(id: string, status: TicketStatus, additionalData?: any) {
    return this.prisma.ticket.update({
      where: { id },
      data: { status, ...additionalData },
    });
  }

  async assignStaff(id: string, staffId: string) {
    return this.prisma.ticket.update({
      where: { id },
      data: {
        assignedTo: staffId,
        status: TicketStatus.ASSIGNED,
      },
    });
  }

  async getAverageResolutionTime(
    hostelId: string,
    category: string,
  ): Promise<number | null> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.prisma.ticket.aggregate({
      where: {
        hostelId,
        category,
        status: TicketStatus.RESOLVED,
        resolvedAt: { not: null },
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
    });

    if (result._count.id === 0) return null;

    // Calculate average resolution time using raw SQL for DATE_PART
    const avgResult = await this.prisma.$queryRaw<
      Array<{ avg_hours: number }>
    >`
      SELECT AVG(EXTRACT(EPOCH FROM ("resolvedAt" - "createdAt")) / 3600) as avg_hours
      FROM tickets
      WHERE "hostelId" = ${hostelId}
        AND category = ${category}
        AND status = 'RESOLVED'
        AND "resolvedAt" IS NOT NULL
        AND "createdAt" >= ${thirtyDaysAgo}
    `;

    return avgResult[0]?.avg_hours ?? null;
  }
}
