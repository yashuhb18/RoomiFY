import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../../common/decorators';
import { Role } from '@prisma/client';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles(Role.SUPER_ADMIN)
  @Get('metrics')
  async getMetrics() {
    return this.adminService.getPlatformMetrics();
  }

  @Roles(Role.SUPER_ADMIN)
  @Get('hostels')
  async getHostels() {
    return this.adminService.getAllHostels();
  }

  @Roles(Role.SUPER_ADMIN)
  @Post('hostels')
  async createHostel(@Body() body: { name: string; address?: string }) {
    return this.adminService.createHostel(body.name, body.address);
  }

  @Roles(Role.SUPER_ADMIN)
  @Get('users')
  async getUsers(
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(role, search);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') userId: string,
    @Body() body: { role: Role },
  ) {
    return this.adminService.updateUserRole(userId, body.role);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch('users/:id/status')
  async toggleUserStatus(
    @Param('id') userId: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.adminService.toggleUserStatus(userId, body.isActive);
  }

  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  @Patch('users/:id/suspend')
  async toggleStudentSuspension(
    @Param('id') userId: string,
    @Body() body: { isSuspended: boolean; reason?: string },
  ) {
    return this.adminService.toggleStudentSuspension(userId, body.isSuspended, body.reason);
  }

  // ─── Rooms & Vacancies ──────────────────────────────────────────────────
  @Roles(Role.SUPER_ADMIN)
  @Get('rooms')
  async getRooms(@Query('hostelId') hostelId?: string) {
    return this.adminService.getAllRooms(hostelId);
  }

  @Roles(Role.SUPER_ADMIN)
  @Post('rooms')
  async createRoom(@Body() dto: any) {
    return this.adminService.createRoom(dto);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch('rooms/:id')
  async updateRoom(@Param('id') id: string, @Body() dto: any) {
    return this.adminService.updateRoom(id, dto);
  }

  @Roles(Role.SUPER_ADMIN)
  @Post('rooms/:id/images')
  async addRoomImage(@Param('id') id: string, @Body() body: { secureUrl: string }) {
    return this.adminService.addRoomImage(id, body.secureUrl);
  }

  // ─── Floors ────────────────────────────────────────────────────────────
  @Roles(Role.SUPER_ADMIN)
  @Get('floors')
  async getFloors(@Query('hostelId') hostelId?: string) {
    return this.adminService.getAllFloors(hostelId);
  }

  @Roles(Role.SUPER_ADMIN)
  @Post('floors')
  async createFloor(@Body() body: { hostelId: string; floorNumber: number; name?: string }) {
    return this.adminService.createFloor(body.hostelId, body.floorNumber, body.name);
  }

  // ─── Ticket SLA Monitoring ──────────────────────────────────────────────
  @Roles(Role.SUPER_ADMIN)
  @Get('tickets')
  async getTickets(
    @Query('hostelId') hostelId?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllTickets(hostelId, status);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch('tickets/:id/status')
  async updateTicketStatus(
    @Param('id') id: string,
    @Body() body: { status: any },
  ) {
    return this.adminService.updateTicketStatus(id, body.status);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch('tickets/:id/assign')
  async assignTicketStaff(
    @Param('id') id: string,
    @Body() body: { staffId: string },
  ) {
    return this.adminService.assignTicketStaff(id, body.staffId);
  }

  @Roles(Role.SUPER_ADMIN)
  @Post('evict-student')
  async evictStudent(
    @Body() body: { studentId: string; ticketId?: string; evictionReason?: string },
  ) {
    return this.adminService.evictStudent(body.studentId, body.ticketId, body.evictionReason);
  }
}
