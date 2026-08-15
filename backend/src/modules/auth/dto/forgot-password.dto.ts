import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email!: string;
}

export class ResetPasswordWithOtpDto {
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Verification code must be 6 digits.' })
  otp!: string;

  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 characters.' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters.' })
  newPassword!: string;
}
