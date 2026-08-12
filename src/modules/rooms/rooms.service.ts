import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { RoomsRepository } from './rooms.repository';
import { CreateRoomDto } from './dto/create-room.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  constructor(
    private readonly roomsRepository: RoomsRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(hostelId: string, dto: CreateRoomDto, userId: string) {
    try {
      const room = await this.roomsRepository.create(hostelId, dto);

      await this.auditService.log({
        action: 'ROOM_CREATED',
        newValue: { roomNumber: room.roomNumber, floor: room.floor, capacity: room.capacity },
        hostelId,
        userId,
      });

      return room;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('A room with this number already exists in this hostel.');
      }
      this.logger.error('Error creating room', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to create room.');
    }
  }

  async findById(id: string) {
    try {
      const room = await this.roomsRepository.findById(id);
      if (!room) {
        throw new NotFoundException('Room not found.');
      }
      return room;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error fetching room', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to fetch room.');
    }
  }

  async findByHostel(hostelId: string) {
    try {
      return this.roomsRepository.findByHostel(hostelId);
    } catch (error) {
      this.logger.error('Error fetching rooms', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to fetch rooms.');
    }
  }

  async update(id: string, dto: Partial<CreateRoomDto>, hostelId: string, userId: string) {
    try {
      const existing = await this.roomsRepository.findById(id);
      if (!existing) {
        throw new NotFoundException('Room not found.');
      }

      const updated = await this.roomsRepository.update(id, dto);

      await this.auditService.log({
        action: 'ROOM_UPDATED',
        oldValue: { roomNumber: existing.roomNumber, floor: existing.floor },
        newValue: { roomNumber: updated.roomNumber, floor: updated.floor },
        hostelId,
        userId,
      });

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error updating room', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to update room.');
    }
  }

  async delete(id: string, hostelId: string, userId: string) {
    try {
      const existing = await this.roomsRepository.findById(id);
      if (!existing) {
        throw new NotFoundException('Room not found.');
      }

      await this.roomsRepository.delete(id);

      await this.auditService.log({
        action: 'ROOM_DELETED',
        oldValue: { roomNumber: existing.roomNumber },
        hostelId,
        userId,
      });

      return { message: 'Room deleted successfully.' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error deleting room', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to delete room.');
    }
  }

  async getOccupancyStats(hostelId: string) {
    try {
      return this.roomsRepository.getOccupancyStats(hostelId);
    } catch (error) {
      this.logger.error('Error fetching occupancy', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to fetch occupancy stats.');
    }
  }
}
