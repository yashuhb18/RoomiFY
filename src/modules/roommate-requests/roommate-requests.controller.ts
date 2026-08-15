import { Controller, Get, Post, Patch, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { Role } from '@prisma/client';
import { RoommateRequestsService } from './roommate-requests.service';
import { CurrentUser, JwtPayload, Roles } from '../../common/decorators';

@Controller('roommate-requests')
export class RoommateRequestsController {
  constructor(private readonly roommateRequestsService: RoommateRequestsService) {}

  @Post()
  @Roles(Role.STUDENT)
  async sendRequest(
    @Body() body: { targetId: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.roommateRequestsService.sendRequest(user.sub, body.targetId, user.hostelId);
  }

  @Get('my')
  @Roles(Role.STUDENT)
  async getMyRequests(@CurrentUser() user: JwtPayload) {
    return this.roommateRequestsService.getMyRequests(user.sub);
  }

  @Patch(':id/accept')
  @Roles(Role.STUDENT)
  async acceptRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.roommateRequestsService.acceptRequest(id, user.sub, user.hostelId);
  }

  @Patch(':id/reject')
  @Roles(Role.STUDENT)
  async rejectRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.roommateRequestsService.rejectRequest(id, user.sub, user.hostelId);
  }

  @Patch(':id/cancel')
  @Roles(Role.STUDENT)
  async cancelRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.roommateRequestsService.cancelRequest(id, user.sub, user.hostelId);
  }
}
