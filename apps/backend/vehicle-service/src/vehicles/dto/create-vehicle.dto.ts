import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  IsPositive,
  Min,
  Max,
  MaxLength,
  IsUrl,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FuelType, TransmissionType, VehicleCondition, VehicleStatus } from '@prisma/client';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Vehicle make/brand',
    example: 'Toyota',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  make: string;

  @ApiProperty({
    description: 'Vehicle model',
    example: 'Camry',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  model: string;

  @ApiProperty({
    description: 'Vehicle year',
    example: 2020,
    minimum: 1900,
    maximum: 2030,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(1900)
  @Max(2030)
  year: number;

  @ApiProperty({
    description: 'Vehicle mileage in kilometers',
    example: 50000,
    minimum: 0,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  mileage: number;

  @ApiProperty({
    description: 'Fuel type of the vehicle',
    enum: FuelType,
    example: FuelType.GASOLINE,
  })
  @IsEnum(FuelType)
  fuelType: FuelType;

  @ApiProperty({
    description: 'Vehicle transmission type',
    enum: TransmissionType,
    example: TransmissionType.AUTOMATIC,
  })
  @IsEnum(TransmissionType)
  transmission: TransmissionType;

  @ApiProperty({
    description: 'Vehicle condition',
    enum: VehicleCondition,
    example: VehicleCondition.GOOD,
  })
  @IsEnum(VehicleCondition)
  condition: VehicleCondition;

  @ApiPropertyOptional({
    description: 'Vehicle status',
    enum: VehicleStatus,
    example: VehicleStatus.DRAFT,
    default: VehicleStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus = VehicleStatus.DRAFT;

  @ApiPropertyOptional({
    description: 'Vehicle description',
    example: 'Well-maintained family car with full service history',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Vehicle images URLs',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[] = [];

  @ApiPropertyOptional({
    description: 'Engine size in liters',
    example: 2.5,
    minimum: 0.1,
    maximum: 20,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0.1)
  @Max(20)
  engineSize?: number;

  @ApiPropertyOptional({
    description: 'Vehicle color',
    example: 'Blue',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  color?: string;

  @ApiPropertyOptional({
    description: 'Vehicle Identification Number (VIN)',
    example: '1HGBH41JXMN109186',
  })
  @IsOptional()
  @IsString()
  @MaxLength(17)
  @Matches(/^[A-HJ-NPR-Z0-9]{17}$/, {
    message: 'VIN must be exactly 17 characters and contain only valid VIN characters',
  })
  vin?: string;

  @ApiPropertyOptional({
    description: 'License plate number',
    example: 'ABC-123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  licensePlate?: string;

  @ApiPropertyOptional({
    description: 'Vehicle location',
    example: 'Istanbul, Turkey',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;



  @ApiProperty({
    description: 'Category ID',
    example: 'clp1234567890',
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}