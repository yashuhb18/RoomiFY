import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUser, JwtPayload, Roles } from '../../common/decorators';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.getProfile(user.sub);
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, dto, user.hostelId);
  }

  @Patch('change-password')
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.sub, dto, user.hostelId);
  }

  @Get('matches')
  @Roles(Role.STUDENT)
  async getMatches(@CurrentUser() user: JwtPayload) {
    return this.usersService.findMatches(user.sub, user.hostelId);
  }

  @Get()
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.usersService.findAll(user.hostelId);
  }

  @Delete(':id')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async deactivateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usersService.deactivateUser(id, user.sub, user.hostelId);
  }
}
