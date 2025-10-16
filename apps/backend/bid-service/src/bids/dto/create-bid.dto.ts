import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBidDto {
  @ApiProperty({ description: 'Auction ID' })
  @IsNotEmpty()
  @IsString()
  auctionId: string;

  @ApiProperty({ description: 'Bid amount' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Bidder ID (automatically set from JWT token)' })
  @IsOptional()
  @IsString()
  bidderId?: string;

  @ApiPropertyOptional({ description: 'Whether this is an automatic bid' })
  @IsOptional()
  @IsBoolean()
  isAutomatic?: boolean;

  @ApiPropertyOptional({ description: 'Maximum amount for auto-bidding' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({ description: 'Notes for the bid' })
  @IsOptional()
  @IsString()
  notes?: string;
}