import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface AuditLogEntry {
  action: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  hostelId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: entry.action,
          oldValue: entry.oldValue ?? undefined,
          newValue: entry.newValue ?? undefined,
          hostelId: entry.hostelId,
          userId: entry.userId,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      });
    } catch (error) {
      // Audit logging should never crash the application
      this.logger.error(
        `Failed to write audit log: ${entry.action}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async getAuditLogs(
    hostelId: string,
    options?: {
      userId?: string;
      action?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    },
  ) {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 50, 100);
    const skip = (page - 1) * limit;

    const where: any = { hostelId };

    if (options?.userId) {
      where.userId = options.userId;
    }

    if (options?.action) {
      where.action = { contains: options.action, mode: 'insensitive' };
    }

    if (options?.startDate || options?.endDate) {
      where.timestamp = {};
      if (options?.startDate) {
        where.timestamp.gte = options.startDate;
      }
      if (options?.endDate) {
        where.timestamp.lte = options.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, role: true },
          },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
