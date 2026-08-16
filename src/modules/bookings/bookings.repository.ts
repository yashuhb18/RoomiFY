import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus, Prisma } from '@prisma/client';

@Injectable()
export class BookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        room: true,
        student: {
          select: { id: true, email: true, role: true },
        },
      },
    });
  }

  async findByStudent(studentId: string) {
    return this.prisma.booking.findMany({
      where: { studentId },
      include: {
        room: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByHostel(hostelId: string) {
    return this.prisma.booking.findMany({
      where: {
        room: { hostelId },
      },
      include: {
        room: true,
        student: {
          select: { id: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActiveByStudent(studentId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        studentId,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
      },
      include: { room: true },
      orderBy: { createdAt: 'desc' },
    });

    if (booking) return booking;

    const allocation = await this.prisma.allocation.findFirst({
      where: {
        studentId,
        status: { in: ['ALLOCATED' as any, 'CHECKED_IN' as any] },
      },
      include: { room: true },
      orderBy: { createdAt: 'desc' },
    });

    if (allocation) {
      return {
        id: allocation.id,
        roomId: allocation.roomId,
        studentId: allocation.studentId,
        startDate: allocation.createdAt,
        endDate: allocation.updatedAt,
        status: allocation.status,
        room: allocation.room,
      };
    }

    return null;
  }

  async updateStatus(id: string, status: BookingStatus, additionalData?: Prisma.BookingUpdateInput) {
    return this.prisma.booking.update({
      where: { id },
      data: {
        status,
        ...additionalData,
      },
      include: { room: true },
    });
  }
}
