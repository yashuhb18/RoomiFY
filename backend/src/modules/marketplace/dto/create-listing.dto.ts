import { IsString, IsNumber, IsOptional, MaxLength, Min } from 'class-validator';

export class CreateListingDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsNumber()
  @Min(1)
  price!: number;
}

export class BuyItemDto {
  @IsString()
  itemId!: string;
}
