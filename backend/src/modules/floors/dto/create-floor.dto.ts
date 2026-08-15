import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateFloorDto {
  @IsInt()
  @Min(0)
  floorNumber: number;

  @IsOptional()
  @IsString()
  name?: string;
}
