import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @MaxLength(20)
  roomNumber!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  floor?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  capacity?: number;
}
