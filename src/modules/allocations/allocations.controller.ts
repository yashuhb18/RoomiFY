import { Controller, Get, Patch, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AllocationsService } from './allocations.service';
import { CurrentUser, JwtPayload, Roles } from '../../common/decorators';

@Controller('allocations')
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  @Get('my')
  @Roles(Role.STUDENT)
  async getMyAllocation(@CurrentUser() user: JwtPayload) {
    return this.allocationsService.getMyAllocation(user.sub);
  }

  @Get()
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.allocationsService.findByHostel(user.hostelId);
  }

  @Patch(':id/check-in')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async checkIn(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.allocationsService.checkIn(id, user.sub, user.hostelId);
  }

  @Patch(':id/check-out')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async checkOut(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { releaseReason?: string },
  ) {
    return this.allocationsService.checkOut(id, user.sub, user.hostelId, body?.releaseReason);
  }

  @Post(':id/transfer-request')
  @Roles(Role.STUDENT)
  async requestTransfer(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.allocationsService.requestTransfer(id, user.sub);
  }

  @Patch(':id/transfer')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async approveTransfer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { newRoomId: string; newBedId: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.allocationsService.approveTransfer(id, body.newRoomId, body.newBedId, user.sub, user.hostelId);
  }
}
