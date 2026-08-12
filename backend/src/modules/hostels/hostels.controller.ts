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
import { HostelsService } from './hostels.service';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { CurrentUser, JwtPayload, Roles } from '../../common/decorators';

@Controller('hostels')
export class HostelsController {
  constructor(private readonly hostelsService: HostelsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  async create(
    @Body() dto: CreateHostelDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.hostelsService.create(dto, user.sub);
  }

  @Get()
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async findAll() {
    return this.hostelsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.hostelsService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateHostelDto>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.hostelsService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.hostelsService.delete(id, user.sub);
  }
}
