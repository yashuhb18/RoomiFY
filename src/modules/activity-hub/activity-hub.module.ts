import { Module } from '@nestjs/common';
import { ActivityHubController } from './activity-hub.controller';
import { ActivityHubService } from './activity-hub.service';
import { ActivityHubRepository } from './activity-hub.repository';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [ActivityHubController],
  providers: [ActivityHubService, ActivityHubRepository],
  exports: [ActivityHubService],
})
export class ActivityHubModule {}
