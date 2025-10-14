import { IsNotEmpty, IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBidDto {
  @ApiProperty({ description: 'Auction ID' })
  @IsNotEmpty()
  @IsString()
  auctionId: string;

  @ApiProperty({ description: 'Bid amount', minimum: 0 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Bidder ID' })
  @IsNotEmpty()
  @IsString()
  bidderId: string;

  @ApiProperty({ description: 'Optional bid notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}