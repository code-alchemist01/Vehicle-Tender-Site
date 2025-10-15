import { IsString, IsNumber, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethodType } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Auction ID' })
  @IsString()
  auctionId: string;

  @ApiProperty({ description: 'Bidder ID' })
  @IsString()
  bidderId: string;

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethodType })
  @IsEnum(PaymentMethodType)
  paymentMethod: PaymentMethodType;

  @ApiPropertyOptional({ description: 'Stripe payment method ID' })
  @IsString()
  @IsOptional()
  stripePaymentMethodId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: any;
}