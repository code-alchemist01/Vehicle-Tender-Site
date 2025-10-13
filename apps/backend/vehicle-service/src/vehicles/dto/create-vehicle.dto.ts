import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateVehicleDto {
  @ApiProperty({ description: 'Vehicle title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Vehicle description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Vehicle brand' })
  @IsString()
  brand: string;

  @ApiProperty({ description: 'Vehicle model' })
  @IsString()
  model: string;

  @ApiProperty({ description: 'Vehicle manufacturing year', minimum: 1900, maximum: 2030 })
  @IsNumber()
  @Min(1900)
  @Max(2030)
  year: number;

  @ApiPropertyOptional({ description: 'Vehicle mileage in kilometers' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  mileage?: number;

  @ApiProperty({ description: 'Fuel type (BENZIN, DIZEL, HIBRIT, ELEKTRIK, LPG, CNG)' })
  @IsString()
  fuelType: string;

  @ApiProperty({ description: 'Transmission type (MANUEL, OTOMATIK, YARIMOTOMATIK, CVT)' })
  @IsString()
  transmission: string;

  @ApiProperty({ description: 'Vehicle condition (EXCELLENT, VERY_GOOD, GOOD, FAIR, POOR)' })
  @IsString()
  condition: string;

  @ApiPropertyOptional({ description: 'Vehicle status (DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, ACTIVE, SOLD, ARCHIVED)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'JSON string of image URLs' })
  @IsOptional()
  @IsString()
  images?: string;

  @ApiPropertyOptional({ description: 'Reserve price (minimum acceptable bid)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  reservePrice?: number;

  @ApiProperty({ description: 'Owner user ID' })
  @IsString()
  userId: string;
}