import { Injectable, Logger, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class FloorsService {
  private readonly logger = new Logger(FloorsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(hostelId: string, dto: CreateFloorDto, userId: string) {
    try {
      const floor = await this.prisma.floor.create({
        data: {
          floorNumber: dto.floorNumber,
          name: dto.name || `Floor ${dto.floorNumber}`,
          hostelId,
        },
      });

      await this.auditService.log({
        action: 'FLOOR_CREATED',
        newValue: { floorNumber: floor.floorNumber, name: floor.name },
        hostelId,
        userId,
      });

      return floor;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('A floor with this number already exists in this hostel.');
      }
      this.logger.error('Error creating floor', error?.stack);
      throw new InternalServerErrorException('Failed to create floor.');
    }
  }

  async findByHostel(hostelId: string) {
    return this.prisma.floor.findMany({
      where: { hostelId },
      include: {
        _count: { select: { rooms: true } },
      },
      orderBy: { floorNumber: 'asc' },
    });
  }

  async findById(id: string) {
    const floor = await this.prisma.floor.findUnique({
      where: { id },
      include: {
        rooms: {
          include: { _count: { select: { beds: true } } },
          orderBy: { roomNumber: 'asc' },
        },
      },
    });
    if (!floor) throw new NotFoundException('Floor not found.');
    return floor;
  }

  async update(id: string, dto: Partial<CreateFloorDto>, hostelId: string, userId: string) {
    const existing = await this.prisma.floor.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Floor not found.');

    const updated = await this.prisma.floor.update({
      where: { id },
      data: { ...dto },
    });

    await this.auditService.log({
      action: 'FLOOR_UPDATED',
      oldValue: { floorNumber: existing.floorNumber, name: existing.name },
      newValue: { floorNumber: updated.floorNumber, name: updated.name },
      hostelId,
      userId,
    });

    return updated;
  }

  async delete(id: string, hostelId: string, userId: string) {
    const existing = await this.prisma.floor.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Floor not found.');

    await this.prisma.floor.delete({ where: { id } });

    await this.auditService.log({
      action: 'FLOOR_DELETED',
      oldValue: { floorNumber: existing.floorNumber, name: existing.name },
      hostelId,
      userId,
    });

    return { message: 'Floor deleted successfully.' };
  }
}
