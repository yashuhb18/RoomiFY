import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async createInvoice(hostelId: string, dto: CreateInvoiceDto) {
    // Validate student belongs to the hostel
    const student = await this.prisma.user.findFirst({
      where: { id: dto.studentId, hostelId },
    });

    if (!student) {
      throw new NotFoundException('Student not found in your hostel');
    }

    return this.prisma.invoice.create({
      data: {
        title: dto.title,
        description: dto.description,
        amount: dto.amount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        studentId: dto.studentId,
        hostelId,
      },
      include: {
        student: {
          select: { profile: true, email: true },
        },
      },
    });
  }

  async getHostelInvoices(hostelId: string) {
    return this.prisma.invoice.findMany({
      where: { hostelId },
      include: {
        student: {
          select: { profile: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStudentInvoices(studentId: string) {
    return this.prisma.invoice.findMany({
      where: { studentId },
      include: {
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInvoiceDetails(invoiceId: string, hostelId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        student: {
          select: { profile: true, email: true },
        },
        payments: true,
      },
    });

    if (!invoice || (invoice.hostelId !== hostelId && invoice.studentId !== hostelId)) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }
}
