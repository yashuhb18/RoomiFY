import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomCondition, RoomStatus, RoomType } from '@prisma/client';

@Injectable()
export class RoomsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(hostelId: string, dto: CreateRoomDto) {
    const capacity = dto.capacity || 2;
    
    // Create room + beds inside a transaction
    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: {
          roomNumber: dto.roomNumber,
          floor: dto.floor,
          floorId: dto.floorId,
          capacity,
          roomType: (dto.roomType as RoomType) || RoomType.DOUBLE,
          condition: (dto.condition as RoomCondition) || RoomCondition.GOOD,
          status: RoomStatus.AVAILABLE,
          facilities: dto.facilities || ['bed', 'study_table', 'cupboard', 'fan', 'wifi'],
          description: dto.description || `Room ${dto.roomNumber} on Floor ${dto.floor}`,
          gender: dto.gender || 'any',
          hostelId,
        },
      });

      // Auto-generate Bed records (Bed 1 to Bed capacity)
      const bedsData = Array.from({ length: capacity }, (_, i) => ({
        bedNumber: i + 1,
        label: `Bed ${i + 1}`,
        isAvailable: true,
        roomId: room.id,
      }));

      await tx.bed.createMany({ data: bedsData });

      return tx.room.findUnique({
        where: { id: room.id },
        include: { beds: true, images: true, floorRef: true },
      });
    });
  }

  async findById(id: string) {
    return this.prisma.room.findUnique({
      where: { id },
      include: {
        floorRef: true,
        beds: {
          include: {
            allocations: {
              where: { status: { in: ['ALLOCATED', 'CHECKED_IN'] } },
              include: {
                student: {
                  select: { id: true, email: true, profile: true },
                },
              },
            },
          },
          orderBy: { bedNumber: 'asc' },
        },
        images: { orderBy: { displayOrder: 'asc' } },
        allocations: {
          where: { status: { in: ['ALLOCATED', 'CHECKED_IN'] } },
          include: {
            student: { select: { id: true, email: true, profile: true } },
            bed: true,
          },
        },
      },
    });
  }

  async findByHostel(hostelId: string) {
    return this.prisma.room.findMany({
      where: { hostelId },
      include: {
        floorRef: true,
        beds: true,
        images: { orderBy: { displayOrder: 'asc' } },
        _count: {
          select: { allocations: true },
        },
      },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });
  }

  async findAvailableRooms(hostelId: string, filters?: {
    floor?: number;
    roomType?: string;
    condition?: string;
    minBeds?: number;
  }) {
    const where: any = {
      hostelId,
      status: { in: [RoomStatus.AVAILABLE, RoomStatus.PARTIALLY_OCCUPIED] },
      condition: { notIn: [RoomCondition.UNDER_MAINTENANCE, RoomCondition.UNAVAILABLE] },
    };

    if (filters?.floor !== undefined) {
      where.floor = filters.floor;
    }
    if (filters?.roomType) {
      where.roomType = filters.roomType;
    }
    if (filters?.condition) {
      where.condition = filters.condition;
    }

    const rooms = await this.prisma.room.findMany({
      where,
      include: {
        floorRef: true,
        images: { orderBy: { displayOrder: 'asc' } },
        beds: { where: { isAvailable: true } },
        allocations: {
          where: { status: { in: ['ALLOCATED', 'CHECKED_IN'] } },
          include: {
            student: {
              select: { id: true, email: true, profile: true },
            },
          },
        },
      },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });

    // Filter by available beds count if requested
    if (filters?.minBeds) {
      return rooms.filter(r => (r.capacity - r.currentOccupancy) >= filters.minBeds!);
    }

    return rooms;
  }

  async update(id: string, data: any) {
    return this.prisma.room.update({
      where: { id },
      data,
      include: { beds: true, images: true, floorRef: true },
    });
  }

  async delete(id: string) {
    return this.prisma.room.delete({
      where: { id },
    });
  }

  async getOccupancyStats(hostelId: string) {
    return this.prisma.room.findMany({
      where: { hostelId },
      select: {
        id: true,
        roomNumber: true,
        floor: true,
        capacity: true,
        currentOccupancy: true,
        status: true,
        condition: true,
        roomType: true,
      },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });
  }
}
