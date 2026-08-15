import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { Role } from '@prisma/client';
import { FloorsService } from './floors.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { CurrentUser, JwtPayload, Roles, Public } from '../../common/decorators';

@Controller('floors')
export class FloorsController {
  constructor(private readonly floorsService: FloorsService) {}

  @Post()
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async create(@Body() dto: CreateFloorDto, @CurrentUser() user: JwtPayload) {
    return this.floorsService.create(user.hostelId, dto, user.sub);
  }

  @Public()
  @Get()
  async findByHostel(@CurrentUser() user: JwtPayload) {
    // If user is authenticated, use their hostelId. Otherwise, return all for the first hostel.
    if (user?.hostelId) {
      return this.floorsService.findByHostel(user.hostelId);
    }
    return [];
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.floorsService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateFloorDto>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.floorsService.update(id, dto, user.hostelId, user.sub);
  }

  @Delete(':id')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.floorsService.delete(id, user.hostelId, user.sub);
  }
}
