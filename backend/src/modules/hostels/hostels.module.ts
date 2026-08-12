import { Module } from '@nestjs/common';
import { HostelsController } from './hostels.controller';
import { HostelsService } from './hostels.service';
import { HostelsRepository } from './hostels.repository';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [HostelsController],
  providers: [HostelsService, HostelsRepository],
  exports: [HostelsService],
})
export class HostelsModule {}
