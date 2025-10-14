import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BidQueryDto {
  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false, default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ description: 'Filter by auction ID', required: false })
  @IsOptional()
  @IsString()
  auctionId?: string;

  @ApiProperty({ description: 'Filter by bidder ID', required: false })
  @IsOptional()
  @IsString()
  bidderId?: string;

  @ApiProperty({ description: 'Filter by bid status', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}