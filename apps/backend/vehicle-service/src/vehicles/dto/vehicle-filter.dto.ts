import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FuelType, TransmissionType, VehicleCondition, VehicleStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class VehicleFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by vehicle make/brand',
    example: 'Toyota',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  make?: string;

  @ApiPropertyOptional({
    description: 'Filter by vehicle model',
    example: 'Camry',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  model?: string;

  @ApiPropertyOptional({
    description: 'Filter by minimum year',
    example: 2015,
    minimum: 1900,
    maximum: 2030,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1900)
  @Max(2030)
  yearFrom?: number;

  @ApiPropertyOptional({
    description: 'Filter by maximum year',
    example: 2023,
    minimum: 1900,
    maximum: 2030,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1900)
  @Max(2030)
  yearTo?: number;

  @ApiPropertyOptional({
    description: 'Filter by minimum mileage in kilometers',
    example: 10000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  mileageFrom?: number;

  @ApiPropertyOptional({
    description: 'Filter by maximum mileage in kilometers',
    example: 100000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  mileageTo?: number;

  @ApiPropertyOptional({
    description: 'Filter by minimum price',
    example: 10000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  priceFrom?: number;

  @ApiPropertyOptional({
    description: 'Filter by maximum price',
    example: 50000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  priceTo?: number;

  @ApiPropertyOptional({
    description: 'Filter by fuel type',
    enum: FuelType,
    example: FuelType.GASOLINE,
  })
  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @ApiPropertyOptional({
    description: 'Filter by transmission type',
    enum: TransmissionType,
    example: TransmissionType.AUTOMATIC,
  })
  @IsOptional()
  @IsEnum(TransmissionType)
  transmission?: TransmissionType;

  @ApiPropertyOptional({
    description: 'Filter by vehicle condition',
    enum: VehicleCondition,
    example: VehicleCondition.GOOD,
  })
  @IsOptional()
  @IsEnum(VehicleCondition)
  condition?: VehicleCondition;

  @ApiPropertyOptional({
    description: 'Filter by category ID',
    example: 'clp1234567890',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by vehicle location',
    example: 'Istanbul',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({
    description: 'Filter by vehicle status',
    enum: VehicleStatus,
    example: VehicleStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;
}