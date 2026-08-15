import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CurrentUser, JwtPayload, Roles } from '../../common/decorators';
import { Role } from '@prisma/client';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async create(@Body() dto: CreateInvoiceDto, @CurrentUser() user: JwtPayload) {
    return this.invoicesService.createInvoice(user.hostelId, dto);
  }

  @Get('hostel')
  @Roles(Role.WARDEN, Role.SUPER_ADMIN)
  async getHostelInvoices(@CurrentUser() user: JwtPayload) {
    return this.invoicesService.getHostelInvoices(user.hostelId);
  }

  @Get('my')
  async getMyInvoices(@CurrentUser() user: JwtPayload) {
    return this.invoicesService.getStudentInvoices(user.sub);
  }

  @Get(':id')
  async getInvoiceDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload
  ) {
    // For simplicity, we pass either hostelId (warden) or sub (student) to check permissions
    const identifier = user.role === Role.STUDENT ? user.sub : user.hostelId;
    return this.invoicesService.getInvoiceDetails(id, identifier);
  }
}
