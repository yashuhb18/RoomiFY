import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRoomRequestDto {
  @IsUUID()
  roomId: string;

  @IsOptional()
  @IsUUID()
  preferredBedId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
