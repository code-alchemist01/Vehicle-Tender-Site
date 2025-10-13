import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBidDto {
  @ApiProperty({
    description: 'ID of the auction to bid on',
    example: 'clp1234567890abcdef',
  })
  @IsNotEmpty()
  @IsUUID()
  auctionId: string;

  @ApiProperty({
    description: 'Bid amount',
    example: 16000,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;
}