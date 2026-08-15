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
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RoomCondition, RoomStatus } from '@prisma/client';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  constructor(
    private readonly roomsRepository: RoomsRepository,
    private readonly auditService: AuditService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly prisma: PrismaService,
  ) {}

  async create(hostelId: string, dto: CreateRoomDto, userId: string) {
    try {
      const room = await this.roomsRepository.create(hostelId, dto);

      await this.auditService.log({
        action: 'ROOM_CREATED',
        newValue: { roomNumber: room?.roomNumber, floor: room?.floor, capacity: room?.capacity },
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
    const room = await this.roomsRepository.findById(id);
    if (!room) {
      throw new NotFoundException('Room not found.');
    }
    return room;
  }

  async findByHostel(hostelId: string) {
    return this.roomsRepository.findByHostel(hostelId);
  }

  async findAvailableRooms(hostelId: string, filters?: any) {
    return this.roomsRepository.findAvailableRooms(hostelId, filters);
  }

  async update(id: string, dto: Partial<CreateRoomDto>, hostelId: string, userId: string) {
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
  }

  async updateCondition(id: string, condition: RoomCondition, hostelId: string, userId: string) {
    const existing = await this.roomsRepository.findById(id);
    if (!existing) throw new NotFoundException('Room not found.');

    // If changing to UNDER_MAINTENANCE, update status to UNDER_MAINTENANCE automatically
    let status = existing.status;
    if (condition === RoomCondition.UNDER_MAINTENANCE || condition === RoomCondition.UNAVAILABLE) {
      status = RoomStatus.UNDER_MAINTENANCE;
    } else if (existing.status === RoomStatus.UNDER_MAINTENANCE) {
      status = existing.currentOccupancy >= existing.capacity ? RoomStatus.FULL : (existing.currentOccupancy > 0 ? RoomStatus.PARTIALLY_OCCUPIED : RoomStatus.AVAILABLE);
    }

    const updated = await this.roomsRepository.update(id, { condition, status });

    await this.auditService.log({
      action: 'ROOM_CONDITION_CHANGED',
      oldValue: { condition: existing.condition, status: existing.status },
      newValue: { condition: updated.condition, status: updated.status },
      hostelId,
      userId,
    });

    return updated;
  }

  async updateStatus(id: string, status: RoomStatus, hostelId: string, userId: string) {
    const existing = await this.roomsRepository.findById(id);
    if (!existing) throw new NotFoundException('Room not found.');

    const updated = await this.roomsRepository.update(id, { status });

    await this.auditService.log({
      action: 'ROOM_STATUS_CHANGED',
      oldValue: { status: existing.status },
      newValue: { status: updated.status },
      hostelId,
      userId,
    });

    return updated;
  }

  async addRoomImage(roomId: string, file: Express.Multer.File, userId: string, hostelId: string, isPrimary = false) {
    const room = await this.roomsRepository.findById(roomId);
    if (!room) throw new NotFoundException('Room not found.');

    // Upload via Cloudinary CDN (or local fallback)
    const { secureUrl, publicId } = await this.cloudinaryService.uploadImage(file, `rooms/${roomId}`);

    // Count existing images to set displayOrder
    const existingImages = await this.prisma.roomImage.count({ where: { roomId } });

    // If this is set to primary, unset other primaries
    if (isPrimary) {
      await this.prisma.roomImage.updateMany({
        where: { roomId },
        data: { isPrimary: false },
      });
    }

    const roomImage = await this.prisma.roomImage.create({
      data: {
        roomId,
        secureUrl,
        publicId,
        isPrimary: isPrimary || existingImages === 0,
        displayOrder: existingImages,
        uploadedBy: userId,
      },
    });

    await this.auditService.log({
      action: 'ROOM_IMAGE_UPLOADED',
      newValue: { imageId: roomImage.id, url: secureUrl },
      hostelId,
      userId,
    });

    return roomImage;
  }

  async deleteRoomImage(roomId: string, imageId: string, userId: string, hostelId: string) {
    const image = await this.prisma.roomImage.findUnique({ where: { id: imageId } });
    if (!image || image.roomId !== roomId) throw new NotFoundException('Image not found.');

    if (image.publicId) {
      await this.cloudinaryService.deleteImage(image.publicId);
    }

    await this.prisma.roomImage.delete({ where: { id: imageId } });

    await this.auditService.log({
      action: 'ROOM_IMAGE_DELETED',
      oldValue: { imageId },
      hostelId,
      userId,
    });

    return { message: 'Image removed successfully.' };
  }

  async delete(id: string, hostelId: string, userId: string) {
    const existing = await this.roomsRepository.findById(id);
    if (!existing) throw new NotFoundException('Room not found.');

    await this.roomsRepository.delete(id);

    await this.auditService.log({
      action: 'ROOM_DELETED',
      oldValue: { roomNumber: existing.roomNumber },
      hostelId,
      userId,
    });

    return { message: 'Room deleted successfully.' };
  }

  async getOccupancyStats(hostelId: string) {
    return this.roomsRepository.getOccupancyStats(hostelId);
  }
}
