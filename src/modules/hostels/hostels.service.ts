import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HostelsRepository } from './hostels.repository';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class HostelsService {
  private readonly logger = new Logger(HostelsService.name);

  constructor(
    private readonly hostelsRepository: HostelsRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateHostelDto, userId: string) {
    try {
      const hostel = await this.hostelsRepository.create(dto);

      await this.auditService.log({
        action: 'HOSTEL_CREATED',
        newValue: { name: hostel.name, address: hostel.address },
        hostelId: hostel.id,
        userId,
      });

      return hostel;
    } catch (error) {
      this.logger.error('Error creating hostel', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to create hostel.');
    }
  }

  async findById(id: string) {
    try {
      const hostel = await this.hostelsRepository.findById(id);
      if (!hostel) {
        throw new NotFoundException('Hostel not found.');
      }
      return hostel;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error fetching hostel', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to fetch hostel.');
    }
  }

  async findAll() {
    try {
      return this.hostelsRepository.findAll();
    } catch (error) {
      this.logger.error('Error fetching hostels', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to fetch hostels.');
    }
  }

  async update(id: string, dto: Partial<CreateHostelDto>, userId: string) {
    try {
      const existing = await this.hostelsRepository.findById(id);
      if (!existing) {
        throw new NotFoundException('Hostel not found.');
      }

      const updated = await this.hostelsRepository.update(id, dto);

      await this.auditService.log({
        action: 'HOSTEL_UPDATED',
        oldValue: { name: existing.name, address: existing.address },
        newValue: { name: updated.name, address: updated.address },
        hostelId: id,
        userId,
      });

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error updating hostel', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to update hostel.');
    }
  }

  async delete(id: string, userId: string) {
    try {
      const existing = await this.hostelsRepository.findById(id);
      if (!existing) {
        throw new NotFoundException('Hostel not found.');
      }

      await this.hostelsRepository.delete(id);

      await this.auditService.log({
        action: 'HOSTEL_DELETED',
        oldValue: { name: existing.name },
        hostelId: id,
        userId,
      });

      return { message: 'Hostel deleted successfully.' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error deleting hostel', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to delete hostel.');
    }
  }
}
