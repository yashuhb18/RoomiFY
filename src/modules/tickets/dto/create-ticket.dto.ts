import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @MaxLength(50)
  category!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  studentId?: string;
}
