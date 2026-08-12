import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHostelDto } from './dto/create-hostel.dto';

@Injectable()
export class HostelsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateHostelDto) {
    return this.prisma.hostel.create({
      data: {
        name: dto.name,
        address: dto.address,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.hostel.findUnique({
      where: { id },
      include: {
        _count: {
          select: { rooms: true, users: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.hostel.findMany({
      include: {
        _count: {
          select: { rooms: true, users: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Partial<CreateHostelDto>) {
    return this.prisma.hostel.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.hostel.delete({
      where: { id },
    });
  }
}
