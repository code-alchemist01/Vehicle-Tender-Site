import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { PaginationDto, PaginationMetaDto, PaginatedResponseDto } from '@/common/dto/pagination.dto';
import { VehicleStatus, FuelType, TransmissionType, VehicleCondition } from '@prisma/client';

interface VehicleFilters {
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  mileageFrom?: number;
  mileageTo?: number;
  priceFrom?: number;
  priceTo?: number;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  condition?: VehicleCondition;
  categoryId?: string;
  location?: string;
  status?: VehicleStatus;
}

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto, userId: string) {
    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createVehicleDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.vehicle.create({
      data: {
        userId: userId,
        categoryId: createVehicleDto.categoryId,
        make: createVehicleDto.make,
        model: createVehicleDto.model,
        year: createVehicleDto.year,
        fuelType: createVehicleDto.fuelType,
        transmission: createVehicleDto.transmission,
        mileage: createVehicleDto.mileage,
        engineSize: createVehicleDto.engineSize,
        condition: createVehicleDto.condition,
        color: createVehicleDto.color,
        description: createVehicleDto.description,
        images: createVehicleDto.images || [],
        status: createVehicleDto.status || VehicleStatus.DRAFT,
        reservePrice: createVehicleDto.reservePrice,
        location: createVehicleDto.location,
        vin: createVehicleDto.vin,
        licensePlate: createVehicleDto.licensePlate,
        estimatedValue: createVehicleDto.estimatedValue,
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(
    paginationDto: PaginationDto,
    filters: VehicleFilters = {},
  ): Promise<PaginatedResponseDto<any>> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: any = {};

    if (filters.make) {
      where.make = { contains: filters.make, mode: 'insensitive' };
    }

    if (filters.model) {
      where.model = { contains: filters.model, mode: 'insensitive' };
    }

    if (filters.yearFrom || filters.yearTo) {
      where.year = {};
      if (filters.yearFrom) where.year.gte = filters.yearFrom;
      if (filters.yearTo) where.year.lte = filters.yearTo;
    }

    if (filters.mileageFrom || filters.mileageTo) {
      where.mileage = {};
      if (filters.mileageFrom) where.mileage.gte = filters.mileageFrom;
      if (filters.mileageTo) where.mileage.lte = filters.mileageTo;
    }

    if (filters.priceFrom || filters.priceTo) {
      where.estimatedValue = {};
      if (filters.priceFrom) where.estimatedValue.gte = filters.priceFrom;
      if (filters.priceTo) where.estimatedValue.lte = filters.priceTo;
    }

    if (filters.fuelType) {
      where.fuelType = filters.fuelType;
    }

    if (filters.transmission) {
      where.transmission = filters.transmission;
    }

    if (filters.condition) {
      where.condition = filters.condition;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    if (filters.status) {
      where.status = filters.status;
    } else {
      // Default to only show active vehicles for public access
      where.status = { in: [VehicleStatus.ACTIVE] };
    }

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
        },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    const meta = new PaginationMetaDto(page, limit, total);
    return new PaginatedResponseDto(vehicles, meta);
  }

  async findByUser(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<any>> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where: { userId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
        },
      }),
      this.prisma.vehicle.count({ where: { userId: userId } }),
    ]);

    const meta = new PaginationMetaDto(page, limit, total);
    return new PaginatedResponseDto(vehicles, meta);
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto, userId: string) {
    const vehicle = await this.findOne(id);

    // Check if user owns the vehicle
    if (vehicle.userId !== userId) {
      throw new ForbiddenException('You can only update your own vehicles');
    }

    // Verify category exists if being updated
    if (updateVehicleDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateVehicleDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: updateVehicleDto,
      include: {
        category: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const vehicle = await this.findOne(id);

    // Check if user owns the vehicle
    if (vehicle.userId !== userId) {
      throw new ForbiddenException('You can only delete your own vehicles');
    }

    return this.prisma.vehicle.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: VehicleStatus, userId: string) {
    const vehicle = await this.findOne(id);

    // Check if user owns the vehicle
    if (vehicle.userId !== userId) {
      throw new ForbiddenException('You can only update your own vehicles');
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: { status },
      include: {
        category: true,
      },
    });
  }
}