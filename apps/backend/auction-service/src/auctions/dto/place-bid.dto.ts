import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PlaceBidDto {
  @ApiProperty({ description: 'Auction ID' })
  @IsString()
  @IsNotEmpty()
  auctionId: string;

  @ApiProperty({ description: 'Bidder user ID' })
  @IsString()
  @IsNotEmpty()
  bidderId: string;

  @ApiProperty({ description: 'Bid amount', example: '11000.00' })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Is automatic bid', default: false })
  @IsOptional()
  @IsBoolean()
  isAutomatic?: boolean;

  @ApiPropertyOptional({ description: 'Maximum amount for automatic bidding', example: '15000.00' })
  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxAmount?: number;
}