import { IsDateString, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsUUID('4')
  roomId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}
