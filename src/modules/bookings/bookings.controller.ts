import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CurrentUser, JwtPayload, Roles } from '../../common/decorators';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles(Role.STUDENT)
  async create(
    @Body() dto: CreateBookingDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.bookingsService.create(dto, user.sub, user.hostelId);
  }

  @Get('my')
  @Roles(Role.STUDENT)
  async getMyBookings(@CurrentUser() user: JwtPayload) {
    return this.bookingsService.findByStudent(user.sub);
  }

  @Get('active')
  @Roles(Role.STUDENT)
  async getActiveBooking(@CurrentUser() user: JwtPayload) {
    return this.bookingsService.getActiveBooking(user.sub);
  }

  @Get()
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.bookingsService.findByHostel(user.hostelId);
  }

  @Patch(':id/confirm')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.bookingsService.confirm(id, user.hostelId, user.sub);
  }

  @Patch(':id/cancel')
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.bookingsService.cancel(id, user.sub, user.hostelId);
  }

  @Patch(':id/check-in')
  @Roles(Role.WARDEN, Role.STAFF)
  async checkIn(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.bookingsService.checkIn(id, user.hostelId, user.sub);
  }

  @Patch(':id/check-out')
  @Roles(Role.WARDEN, Role.STAFF)
  async checkOut(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.bookingsService.checkOut(id, user.hostelId, user.sub);
  }
}
