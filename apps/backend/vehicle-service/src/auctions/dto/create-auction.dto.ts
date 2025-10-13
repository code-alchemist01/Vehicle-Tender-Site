import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, IsEnum, IsUUID, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuctionStatus } from '@prisma/client';

export class CreateAuctionDto {
  @ApiProperty({
    description: 'ID of the vehicle to auction',
    example: 'clp1234567890abcdef',
  })
  @IsNotEmpty()
  @IsUUID()
  vehicleId: string;

  @ApiProperty({
    description: 'Auction title',
    example: '2020 BMW X5 - Excellent Condition',
    maxLength: 200,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Auction description',
    example: 'Beautiful vintage car in excellent condition',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Starting price for the auction',
    example: 15000,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  startPrice: number;

  @ApiPropertyOptional({
    description: 'Reserve price (minimum acceptable bid)',
    example: 18000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reservePrice?: number;

  @ApiPropertyOptional({
    description: 'Current highest bid (defaults to starting price)',
    example: 15000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentBid?: number;

  @ApiProperty({
    description: 'Auction start time',
    example: '2024-01-15T10:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'Auction end time',
    example: '2024-01-22T10:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({
    description: 'Auction status',
    enum: AuctionStatus,
    example: AuctionStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(AuctionStatus)
  status?: AuctionStatus;
}