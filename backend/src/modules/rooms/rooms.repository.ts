import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(hostelId: string, dto: CreateRoomDto) {
    return this.prisma.room.create({
      data: {
        roomNumber: dto.roomNumber,
        floor: dto.floor,
        capacity: dto.capacity || 2,
        hostelId,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.room.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'CHECKED_IN'] },
          },
          include: {
            student: {
              select: { id: true, email: true },
            },
          },
        },
      },
    });
  }

  async findByHostel(hostelId: string) {
    return this.prisma.room.findMany({
      where: { hostelId },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });
  }

  async update(id: string, data: Partial<CreateRoomDto>) {
    return this.prisma.room.update({
      where: { id },
      data,
    });
  }

  async updateOccupancy(id: string, delta: number) {
    return this.prisma.room.update({
      where: { id },
      data: {
        currentOccupancy: { increment: delta },
      },
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
      },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });
  }
}
