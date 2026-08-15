import { IsInt, IsOptional, IsString, Min, Max, IsArray } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  roomNumber: string;

  @IsInt()
  @Min(0)
  floor: number;

  @IsOptional()
  @IsString()
  floorId?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  capacity: number;

  @IsOptional()
  @IsString()
  roomType?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsArray()
  facilities?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  gender?: string;
}
