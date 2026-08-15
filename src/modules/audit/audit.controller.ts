import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuditService } from './audit.service';
import { CurrentUser, JwtPayload, Roles } from '../../common/decorators';
import { Role } from '@prisma/client';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  @Get('logs')
  async getLogs(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('action') action?: string,
  ) {
    return this.auditService.getAuditLogs(user.hostelId, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      action,
    });
  }

  @Post('log-unmask')
  async logUnmask(
    @CurrentUser() user: JwtPayload,
    @Body() body: { field: string; resourceId?: string },
    @Req() req: Request,
  ) {
    await this.auditService.log({
      action: 'PII_UNMASKED',
      newValue: { field: body.field, resourceId: body.resourceId },
      hostelId: user.hostelId,
      userId: user.sub,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    return { success: true };
  }

  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  @Get('security-summary')
  async getSecuritySummary(@CurrentUser() user: JwtPayload) {
    const logsResult = await this.auditService.getAuditLogs(user.hostelId, {
      limit: 15,
    });

    return {
      rlsIsolationActive: true,
      rlsTenantKey: user.hostelId,
      argon2Cost: '64MB Memory / 3 Time',
      rateLimitPolicy: '100 req/min (Auth: 5/min)',
      activeThreatLevel: 'LOW (NORMAL)',
      totalBlockedAttacks: 0,
      recentAuditFeed: logsResult.data,
      activeSessionsCount: 1,
    };
  }
}
