import { ApiProperty } from '@nestjs/swagger';
import { FuelType, TransmissionType, VehicleCondition, VehicleStatus } from '@prisma/client';

export class VehicleEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  make: string;

  @ApiProperty()
  model: string;

  @ApiProperty()
  year: number;

  @ApiProperty({ enum: FuelType })
  fuelType: FuelType;

  @ApiProperty({ enum: TransmissionType })
  transmission: TransmissionType;

  @ApiProperty()
  mileage: number;

  @ApiProperty()
  engineSize: number;

  @ApiProperty()
  horsePower: number;

  @ApiProperty({ enum: VehicleCondition })
  condition: VehicleCondition;

  @ApiProperty()
  color: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty({ required: false })
  features?: string[];

  @ApiProperty({ enum: VehicleStatus })
  status: VehicleStatus;

  @ApiProperty({ required: false })
  reservePrice?: number;

  @ApiProperty({ required: false })
  startingPrice?: number;

  @ApiProperty({ required: false })
  currentPrice?: number;

  @ApiProperty({ required: false })
  buyNowPrice?: number;

  @ApiProperty()
  location: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<VehicleEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  get displayName(): string {
    return `${this.year} ${this.make} ${this.model}`;
  }

  @ApiProperty()
  get isAvailable(): boolean {
    return this.isActive && this.status === VehicleStatus.ACTIVE;
  }

  @ApiProperty()
  get primaryImage(): string | null {
    return this.images && this.images.length > 0 ? this.images[0] : null;
  }
}