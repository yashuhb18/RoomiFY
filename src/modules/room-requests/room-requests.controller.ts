import { Controller, Get, Post, Patch, Body, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { Role, RequestStatus } from '@prisma/client';
import { RoomRequestsService } from './room-requests.service';
import { CreateRoomRequestDto } from './dto/create-room-request.dto';
import { ApproveRoomRequestDto, RejectRoomRequestDto } from './dto/review-room-request.dto';
import { CurrentUser, JwtPayload, Roles } from '../../common/decorators';

@Controller('room-requests')
export class RoomRequestsController {
  constructor(private readonly roomRequestsService: RoomRequestsService) {}

  @Post()
  @Roles(Role.STUDENT)
  async create(@Body() dto: CreateRoomRequestDto, @CurrentUser() user: JwtPayload) {
    return this.roomRequestsService.createRequest(dto, user.sub, user.hostelId);
  }

  @Get('my')
  @Roles(Role.STUDENT)
  async getMyRequests(@CurrentUser() user: JwtPayload) {
    return this.roomRequestsService.findByStudent(user.sub);
  }

  @Patch(':id/cancel')
  @Roles(Role.STUDENT)
  async cancel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.roomRequestsService.cancelRequest(id, user.sub, user.hostelId);
  }

  @Get()
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: string,
  ) {
    const statusFilter = status && Object.values(RequestStatus).includes(status as RequestStatus)
      ? (status as RequestStatus)
      : undefined;
    return this.roomRequestsService.findByHostel(user.hostelId, statusFilter);
  }

  @Patch(':id/approve')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveRoomRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.roomRequestsService.approveRequest(id, dto, user.sub, user.hostelId);
  }

  @Patch(':id/reject')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectRoomRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.roomRequestsService.rejectRequest(id, dto, user.sub, user.hostelId);
  }
}
