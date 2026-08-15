import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isMfaEnabled: true,
        isActive: true,
        profile: true,
        hostelId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findStudentsByHostel(hostelId: string, excludeUserId: string) {
    return this.prisma.user.findMany({
      where: {
        hostelId,
        role: Role.STUDENT,
        isActive: true,
        id: { not: excludeUserId },
        profile: { not: Prisma.DbNull },
      },
      select: {
        id: true,
        email: true,
        profile: true,
      },
    });
  }

  async updateProfile(userId: string, profile: Record<string, any>) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { profile },
      select: {
        id: true,
        email: true,
        role: true,
        profile: true,
        hostelId: true,
        updatedAt: true,
      },
    });
  }

  async findAll(hostelId: string) {
    return this.prisma.user.findMany({
      where: { hostelId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isMfaEnabled: true,
        profile: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deactivate(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false, refreshTokenHash: null },
    });
  }

  async updatePasswordHash(userId: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}
