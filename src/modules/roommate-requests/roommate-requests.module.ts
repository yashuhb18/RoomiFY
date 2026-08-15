import { Module } from '@nestjs/common';
import { RoommateRequestsController } from './roommate-requests.controller';
import { RoommateRequestsService } from './roommate-requests.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [RoommateRequestsController],
  providers: [RoommateRequestsService],
  exports: [RoommateRequestsService],
})
export class RoommateRequestsModule {}
