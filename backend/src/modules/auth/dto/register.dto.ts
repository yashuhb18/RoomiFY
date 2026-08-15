import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsUUID,
  IsOptional,
  IsObject,
} from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email!: string;

  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 characters.' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters.' })
  password!: string;

  @IsString()
  @IsOptional()
  hostelId?: string;

  @IsEnum(Role, { message: 'Role must be one of: STUDENT, WARDEN, STAFF.' })
  @IsOptional()
  role?: Role;

  @IsObject()
  @IsOptional()
  profile?: Record<string, any>;
}
