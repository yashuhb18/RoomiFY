import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingsRepository } from './bookings.repository';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AuditService } from '../audit/audit.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingsRepository: BookingsRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Creates a booking using Prisma $transaction with FOR UPDATE row locking
   * to prevent double-booking race conditions.
   */
  async create(dto: CreateBookingDto, studentId: string, hostelId: string) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date.');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Start date cannot be in the past.');
    }

    try {
      const booking = await this.prisma.$transaction(async (tx) => {
        // 1. Lock the room row with FOR UPDATE to prevent concurrent modifications
        const rooms = await tx.$queryRaw<
          Array<{ id: string; capacity: number; currentOccupancy: number; hostelId: string }>
        >`
          SELECT id, capacity, "currentOccupancy", "hostelId"
          FROM rooms
          WHERE id = ${dto.roomId}
          FOR UPDATE
        `;

        if (rooms.length === 0) {
          throw new NotFoundException('Room not found.');
        }

        const room = rooms[0];

        // 2. Verify room belongs to user's hostel
        if (room.hostelId !== hostelId) {
          throw new ForbiddenException('Cannot book a room in a different hostel.');
        }

        // 3. Check for overlapping confirmed/checked-in bookings
        const overlapping = await tx.booking.findFirst({
          where: {
            roomId: dto.roomId,
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
            OR: [
              {
                startDate: { lte: endDate },
                endDate: { gte: startDate },
              },
            ],
          },
        });

        if (overlapping) {
          throw new ConflictException(
            'This room is already booked for the requested dates.',
          );
        }

        // 4. Check room capacity
        if (room.currentOccupancy >= room.capacity) {
          throw new ConflictException('This room has reached its maximum capacity.');
        }

        // 5. Check student doesn't already have an active booking
        const existingBooking = await tx.booking.findFirst({
          where: {
            studentId,
            status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
          },
        });

        if (existingBooking) {
          throw new ConflictException(
            'You already have an active booking. Please cancel it before making a new one.',
          );
        }

        // 6. Create the booking
        const newBooking = await tx.booking.create({
          data: {
            roomId: dto.roomId,
            studentId,
            startDate,
            endDate,
            status: BookingStatus.PENDING,
          },
          include: { room: true },
        });

        return newBooking;
      }, {
        isolationLevel: 'Serializable',
        maxWait: 5000,
        timeout: 10000,
      });

      await this.auditService.log({
        action: 'BOOKING_CREATED',
        newValue: {
          bookingId: booking.id,
          roomNumber: booking.room.roomNumber,
          startDate: booking.startDate,
          endDate: booking.endDate,
        },
        hostelId,
        userId: studentId,
      });

      return booking;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error('Booking creation error', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException(
        'Failed to create booking. Please try again.',
      );
    }
  }

  async confirm(bookingId: string, hostelId: string, userId: string) {
    try {
      const booking = await this.bookingsRepository.findById(bookingId);
      if (!booking) {
        throw new NotFoundException('Booking not found.');
      }

      if (booking.status !== BookingStatus.PENDING) {
        throw new BadRequestException(`Cannot confirm a booking with status: ${booking.status}`);
      }

      const updated = await this.prisma.$transaction(async (tx) => {
        const confirmedBooking = await tx.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.CONFIRMED },
          include: { room: true },
        });

        // Increment occupancy
        await tx.room.update({
          where: { id: booking.roomId },
          data: { currentOccupancy: { increment: 1 } },
        });

        return confirmedBooking;
      });

      await this.auditService.log({
        action: 'BOOKING_CONFIRMED',
        oldValue: { status: BookingStatus.PENDING },
        newValue: { status: BookingStatus.CONFIRMED },
        hostelId,
        userId,
      });

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error('Booking confirm error', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to confirm booking.');
    }
  }

  async cancel(bookingId: string, userId: string, hostelId: string) {
    try {
      const booking = await this.bookingsRepository.findById(bookingId);
      if (!booking) {
        throw new NotFoundException('Booking not found.');
      }

      if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.CHECKED_OUT) {
        throw new BadRequestException(`Cannot cancel a booking with status: ${booking.status}`);
      }

      const wasConfirmed = booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.CHECKED_IN;

      const updated = await this.prisma.$transaction(async (tx) => {
        const cancelledBooking = await tx.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.CANCELLED },
          include: { room: true },
        });

        // Decrement occupancy if was confirmed/checked in
        if (wasConfirmed) {
          await tx.room.update({
            where: { id: booking.roomId },
            data: { currentOccupancy: { decrement: 1 } },
          });
        }

        return cancelledBooking;
      });

      await this.auditService.log({
        action: 'BOOKING_CANCELLED',
        oldValue: { status: booking.status },
        newValue: { status: BookingStatus.CANCELLED },
        hostelId,
        userId,
      });

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error('Booking cancel error', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to cancel booking.');
    }
  }

  async checkIn(bookingId: string, hostelId: string, userId: string) {
    try {
      const booking = await this.bookingsRepository.findById(bookingId);
      if (!booking) throw new NotFoundException('Booking not found.');
      if (booking.status !== BookingStatus.CONFIRMED) {
        throw new BadRequestException('Only confirmed bookings can be checked in.');
      }

      const updated = await this.bookingsRepository.updateStatus(
        bookingId,
        BookingStatus.CHECKED_IN,
        { checkedInAt: new Date() },
      );

      await this.auditService.log({
        action: 'BOOKING_CHECKED_IN',
        hostelId,
        userId,
      });

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error('Check-in error', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to check in.');
    }
  }

  async checkOut(bookingId: string, hostelId: string, userId: string) {
    try {
      const booking = await this.bookingsRepository.findById(bookingId);
      if (!booking) throw new NotFoundException('Booking not found.');
      if (booking.status !== BookingStatus.CHECKED_IN) {
        throw new BadRequestException('Only checked-in bookings can be checked out.');
      }

      const updated = await this.prisma.$transaction(async (tx) => {
        const checkedOut = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: BookingStatus.CHECKED_OUT,
            checkedOutAt: new Date(),
          },
          include: { room: true },
        });

        await tx.room.update({
          where: { id: booking.roomId },
          data: { currentOccupancy: { decrement: 1 } },
        });

        return checkedOut;
      });

      await this.auditService.log({
        action: 'BOOKING_CHECKED_OUT',
        hostelId,
        userId,
      });

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error('Check-out error', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to check out.');
    }
  }

  async findByStudent(studentId: string) {
    try {
      return this.bookingsRepository.findByStudent(studentId);
    } catch (error) {
      this.logger.error('Error fetching student bookings', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to fetch bookings.');
    }
  }

  async findByHostel(hostelId: string) {
    try {
      return this.bookingsRepository.findByHostel(hostelId);
    } catch (error) {
      this.logger.error('Error fetching hostel bookings', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to fetch bookings.');
    }
  }

  async getActiveBooking(studentId: string) {
    try {
      return this.bookingsRepository.findActiveByStudent(studentId);
    } catch (error) {
      this.logger.error('Error fetching active booking', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to fetch active booking.');
    }
  }
}
