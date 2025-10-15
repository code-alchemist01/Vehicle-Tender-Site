import { IsString, IsBoolean, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethodType } from '@prisma/client';

export class CreatePaymentMethodDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Payment method type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Stripe payment method ID' })
  @IsString()
  stripeMethodId: string;

  @ApiPropertyOptional({ description: 'Set as default payment method', default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: any;
}