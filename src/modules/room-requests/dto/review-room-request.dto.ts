import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ApproveRoomRequestDto {
  @IsOptional()
  @IsString()
  bedId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectRoomRequestDto {
  @IsString()
  rejectionReason: string;
}
