import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ItemStatus } from '@prisma/client';

@Injectable()
export class MarketplaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title: string;
    description?: string;
    price: number;
    imageUrl?: string;
    hostelId: string;
    sellerId: string;
  }) {
    return this.prisma.marketplaceItem.create({
      data,
      include: {
        seller: { select: { id: true, email: true } },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.marketplaceItem.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, email: true } },
      },
    });
  }

  async findByHostel(hostelId: string) {
    return this.prisma.marketplaceItem.findMany({
      where: { hostelId },
      include: {
        seller: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAvailableByHostel(hostelId: string) {
    return this.prisma.marketplaceItem.findMany({
      where: {
        hostelId,
        status: ItemStatus.AVAILABLE,
      },
      include: {
        seller: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: ItemStatus) {
    return this.prisma.marketplaceItem.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string) {
    return this.prisma.marketplaceItem.delete({
      where: { id },
    });
  }
}
