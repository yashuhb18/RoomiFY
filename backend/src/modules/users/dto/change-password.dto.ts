import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(12, { message: 'New password must be at least 12 characters.' })
  @MaxLength(128, { message: 'New password must not exceed 128 characters.' })
  newPassword!: string;
}
