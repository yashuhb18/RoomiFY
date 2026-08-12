import { IsString, Length } from 'class-validator';

export class MfaVerifyDto {
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits.' })
  token!: string;
}
