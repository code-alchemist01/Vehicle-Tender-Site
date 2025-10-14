import { IsString, IsNotEmpty, IsOptional, IsDecimal, IsDateString, IsBoolean, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateAuctionDto {
  @ApiProperty({ description: 'Auction title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Auction description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Vehicle ID to be auctioned' })
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @ApiProperty({ description: 'Seller user ID' })
  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @ApiProperty({ description: 'Starting price', example: '10000.00' })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  startingPrice: number;

  @ApiPropertyOptional({ description: 'Reserve price', example: '15000.00' })
  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  reservePrice?: number;

  @ApiPropertyOptional({ description: 'Minimum bid increment', example: '100.00', default: 100 })
  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : 100)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  minBidIncrement?: number;

  @ApiProperty({ description: 'Auction start time', example: '2024-01-15T10:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'Auction end time', example: '2024-01-22T10:00:00Z' })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ description: 'Auto extend minutes when bid placed near end', default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  autoExtendMinutes?: number;

  @ApiPropertyOptional({ description: 'Is featured auction', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}