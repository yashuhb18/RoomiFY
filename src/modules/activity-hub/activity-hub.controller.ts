import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ActivityHubService } from './activity-hub.service';
import {
  CompleteTaskDto,
  ConvertCreditsDto,
  LeaderboardQueryDto,
  TransactionQueryDto,
} from './dto/activity-hub.dto';
import { CurrentUser, JwtPayload, Roles } from '../../common/decorators';

@Controller('activity-hub')
export class ActivityHubController {
  constructor(private readonly activityHubService: ActivityHubService) {}

  @Get('dashboard')
  async getDashboard(@CurrentUser() user: JwtPayload) {
    return this.activityHubService.getDashboard(
      user.sub,
      user.role,
      user.hostelId,
    );
  }

  @Get('tasks')
  async getAvailableTasks(@CurrentUser() user: JwtPayload) {
    return this.activityHubService.getAvailableTasks(user.sub, user.role);
  }

  @Post('tasks/complete')
  async completeTask(
    @Body() dto: CompleteTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.activityHubService.completeTask(
      user.sub,
      dto.taskSlug,
      user.role,
      user.hostelId,
    );
  }

  @Post('tasks/verify/:completionId')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async verifyTask(
    @Param('completionId') completionId: string,
    @Body('status') status: 'COMPLETED' | 'REJECTED',
    @CurrentUser() user: JwtPayload,
  ) {
    return this.activityHubService.verifyTask(
      user.sub,
      completionId,
      status || 'COMPLETED',
      user.hostelId,
    );
  }

  @Get('pending-verifications')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async getPendingVerifications(@CurrentUser() user: JwtPayload) {
    return this.activityHubService.getPendingVerifications(user.hostelId);
  }

  @Get('achievements')
  async getAchievements(@CurrentUser() user: JwtPayload) {
    return this.activityHubService.getAchievements(user.sub);
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Query() query: LeaderboardQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.activityHubService.getLeaderboard(
      user.sub,
      user.hostelId,
      query,
    );
  }

  @Get('transactions')
  async getTransactions(
    @Query() query: TransactionQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.activityHubService.getTransactions(
      user.sub,
      query.page,
      query.limit,
    );
  }

  @Get('stats')
  async getStats(@CurrentUser() user: JwtPayload) {
    return this.activityHubService.getStats(user.sub);
  }

  @Post('convert')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async convertCredits(
    @Body() dto: ConvertCreditsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.activityHubService.convertCredits(
      user.sub,
      dto.amount,
      user.hostelId,
    );
  }

  @Get('conversions')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async getConversionHistory(@CurrentUser() user: JwtPayload) {
    return this.activityHubService.getConversionHistory(user.sub);
  }

  @Post('seed')
  @Roles(Role.SUPER_ADMIN, Role.WARDEN)
  async seedTasks() {
    return this.activityHubService.seedTasksAndAchievements();
  }

  @Get('admin/stats')
  @Roles(Role.SUPER_ADMIN)
  async getGlobalStats() {
    return this.activityHubService.getGlobalStats();
  }
}
