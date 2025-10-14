import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAutoBidDto {
  @ApiProperty({ description: 'Auction ID' })
  @IsNotEmpty()
  @IsString()
  auctionId: string;

  @ApiProperty({ description: 'Bidder ID' })
  @IsNotEmpty()
  @IsString()
  bidderId: string;

  @ApiProperty({ description: 'Maximum bid amount', minimum: 0 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxAmount: number;

  @ApiProperty({ description: 'Bid increment amount', minimum: 0 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  incrementAmount: number;
}