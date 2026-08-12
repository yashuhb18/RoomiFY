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
    return this.prisma.booking.findFirst({
      where: {
        studentId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
      },
      include: { room: true },
    });
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
