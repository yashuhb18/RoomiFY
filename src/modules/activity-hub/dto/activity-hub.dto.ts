import { IsString, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';

export class CompleteTaskDto {
  @IsString()
  taskSlug: string;
}

export class VerifyTaskDto {
  @IsString()
  userId: string;

  @IsString()
  taskSlug: string;

  @IsString()
  @IsOptional()
  status?: 'COMPLETED' | 'REJECTED';
}

export class ConvertCreditsDto {
  @IsInt()
  @Min(500)
  @Type(() => Number)
  amount: number;
}

export class LeaderboardQueryDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  hostelId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}

export class TransactionQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
