import { Module } from '@nestjs/common';
import { RoomRequestsController } from './room-requests.controller';
import { RoomRequestsService } from './room-requests.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, AuditModule, MailModule],
  controllers: [RoomRequestsController],
  providers: [RoomRequestsService],
  exports: [RoomRequestsService],
})
export class RoomRequestsModule {}
