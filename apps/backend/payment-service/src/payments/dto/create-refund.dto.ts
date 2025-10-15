import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRefundDto {
  @ApiProperty({ description: 'Payment ID to refund' })
  @IsString()
  paymentId: string;

  @ApiProperty({ description: 'Refund amount' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Reason for refund' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: any;
}