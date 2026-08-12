import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateHostelDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;
}
