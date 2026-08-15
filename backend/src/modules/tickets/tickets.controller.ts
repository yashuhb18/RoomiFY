import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role, TicketStatus } from '@prisma/client';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CurrentUser, JwtPayload, Roles } from '../../common/decorators';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @Roles(Role.STUDENT, Role.WARDEN, Role.SUPER_ADMIN)
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 tickets per hour max
  @UseInterceptors(FileInterceptor('photo', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.match(/^image\/(jpeg|png|webp|gif)$/)) {
        return cb(new Error('Only image files are allowed.'), false);
      }
      cb(null, true);
    },
  }))
  async create(
    @Body() dto: CreateTicketDto,
    @UploadedFile() photo: Express.Multer.File | undefined,
    @CurrentUser() user: JwtPayload,
  ) {
    if (photo) {
      const path = await this.supabaseService.uploadFile(photo, 'tickets');
      dto.photoUrl = path;
    }

    return this.ticketsService.create(dto, user.sub, user.hostelId);
  }

  @Get('my')
  @Roles(Role.STUDENT)
  async getMyTickets(@CurrentUser() user: JwtPayload) {
    return this.ticketsService.findByStudent(user.sub);
  }

  @Get('breach-risks')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async getBreachRisks(@CurrentUser() user: JwtPayload) {
    return this.ticketsService.getBreachRisks(user.hostelId);
  }

  @Get()
  @Roles(Role.WARDEN, Role.STAFF, Role.SUPER_ADMIN)
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.ticketsService.findByHostel(user.hostelId);
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ticketsService.findById(id, user);
  }

  @Patch(':id/assign/:staffId')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async assignStaff(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('staffId', ParseUUIDPipe) staffId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ticketsService.assignStaff(
      id,
      staffId,
      user.hostelId,
      user.sub,
    );
  }

  @Patch(':id/status')
  @Roles(Role.WARDEN, Role.STAFF, Role.SUPER_ADMIN)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: TicketStatus,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.ticketsService.updateStatus(
      id,
      status,
      user.hostelId,
      user.sub,
    );
  }
}
