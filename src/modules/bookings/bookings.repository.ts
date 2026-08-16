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
    const bookings = await this.prisma.booking.findMany({
      where: { studentId },
      include: { room: true },
      orderBy: { createdAt: 'desc' },
    });

    const requests = await this.prisma.roomRequest.findMany({
      where: { studentId },
      include: { room: true },
      orderBy: { requestedAt: 'desc' },
    });

    const mappedRequests = requests.map((r) => ({
      id: r.id,
      roomId: r.roomId,
      studentId: r.studentId,
      startDate: r.requestedAt,
      endDate: r.requestedAt,
      status: r.status === 'PENDING' ? 'PENDING (Warden Review)' : r.status,
      createdAt: r.requestedAt,
      room: r.room,
    }));

    return [...bookings, ...mappedRequests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
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

    const roomRequest = await this.prisma.roomRequest.findFirst({
      where: {
        studentId,
        status: { in: ['PENDING' as any, 'APPROVED' as any] },
      },
      include: { room: true },
      orderBy: { requestedAt: 'desc' },
    });

    if (roomRequest) {
      return {
        id: roomRequest.id,
        roomId: roomRequest.roomId,
        studentId: roomRequest.studentId,
        startDate: roomRequest.requestedAt,
        endDate: roomRequest.requestedAt,
        status: roomRequest.status === 'PENDING' ? 'PENDING (Warden Review)' : roomRequest.status,
        room: roomRequest.room,
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
