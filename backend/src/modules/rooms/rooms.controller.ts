import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { CurrentUser, JwtPayload, Roles } from '../../common/decorators';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async create(
    @Body() dto: CreateRoomDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.roomsService.create(user.hostelId, dto, user.sub);
  }

  @Get()
  async findByHostel(@CurrentUser() user: JwtPayload) {
    return this.roomsService.findByHostel(user.hostelId);
  }

  @Get('occupancy')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async getOccupancyStats(@CurrentUser() user: JwtPayload) {
    return this.roomsService.getOccupancyStats(user.hostelId);
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomsService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateRoomDto>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.roomsService.update(id, dto, user.hostelId, user.sub);
  }

  @Delete(':id')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.roomsService.delete(id, user.hostelId, user.sub);
  }
}
