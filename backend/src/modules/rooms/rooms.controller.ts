import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role, RoomCondition, RoomStatus } from '@prisma/client';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { CurrentUser, JwtPayload, Roles, Public } from '../../common/decorators';

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

  @Get('available')
  async findAvailable(
    @CurrentUser() user: JwtPayload,
    @Query('floor') floor?: string,
    @Query('roomType') roomType?: string,
    @Query('condition') condition?: string,
    @Query('minBeds') minBeds?: string,
  ) {
    const hostelId = user?.hostelId;
    if (!hostelId) return [];

    return this.roomsService.findAvailableRooms(hostelId, {
      floor: floor !== undefined ? parseInt(floor, 10) : undefined,
      roomType,
      condition,
      minBeds: minBeds ? parseInt(minBeds, 10) : undefined,
    });
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

  @Patch(':id/condition')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async updateCondition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { condition: RoomCondition },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.roomsService.updateCondition(id, body.condition, user.hostelId, user.sub);
  }

  @Patch(':id/status')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: RoomStatus },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.roomsService.updateStatus(id, body.status, user.hostelId, user.sub);
  }

  @Post(':id/images')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('isPrimary') isPrimaryStr: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) throw new BadRequestException('Image file is required.');
    const isPrimary = isPrimaryStr === 'true';
    return this.roomsService.addRoomImage(id, file, user.sub, user.hostelId, isPrimary);
  }

  @Delete(':id/images/:imageId')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async deleteImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.roomsService.deleteRoomImage(id, imageId, user.sub, user.hostelId);
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
