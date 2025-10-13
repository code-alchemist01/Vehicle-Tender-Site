import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleQueryDto } from './dto/vehicle-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto) {
    try {
      const vehicle = await this.prisma.vehicle.create({
        data: {
          ...createVehicleDto,
          images: createVehicleDto.images || null,
        },
      });
      return vehicle;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Vehicle with this VIN already exists');
        }
      }
      throw error;
    }
  }

  async findAll(query: VehicleQueryDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.VehicleWhereInput = {};

    if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Apply filters
      if (filters.brand)
        where.brand = { contains: filters.brand, mode: 'insensitive' };
      if (filters.model)
        where.model = { contains: filters.model, mode: 'insensitive' };
      if (filters.fuelType) where.fuelType = filters.fuelType;
      if (filters.transmission) where.transmission = filters.transmission;
      if (filters.condition) where.condition = filters.condition;

    // Year range
    if (filters.yearMin || filters.yearMax) {
      where.year = {};
      if (filters.yearMin) where.year.gte = filters.yearMin;
      if (filters.yearMax) where.year.lte = filters.yearMax;
    }

    // Mileage range
    if (filters.mileageMin || filters.mileageMax) {
      where.mileage = {};
      if (filters.mileageMin) where.mileage.gte = filters.mileageMin;
      if (filters.mileageMax) where.mileage.lte = filters.mileageMax;
    }

    // Price range
    if (filters.priceMin || filters.priceMax) {
      where.reservePrice = {};
      if (filters.priceMin) where.reservePrice.gte = filters.priceMin;
      if (filters.priceMax) where.reservePrice.lte = filters.priceMax;
    }

    // Build orderBy
    const orderBy: Prisma.VehicleOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return vehicle;
  }

  async findByUser(userId: string, query: VehicleQueryDto) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const orderBy: Prisma.VehicleOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.vehicle.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    try {
      const vehicle = await this.prisma.vehicle.update({
        where: { id },
        data: updateVehicleDto,
      });
      return vehicle;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Vehicle with ID ${id} not found`);
        }
        if (error.code === 'P2002') {
          throw new BadRequestException('Vehicle with this VIN already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.vehicle.delete({
        where: { id },
      });
      return { message: 'Vehicle deleted successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Vehicle with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async getStats() {
    const [totalVehicles, vehiclesByFuelType, vehiclesByCondition, priceStats] =
      await Promise.all([
        this.prisma.vehicle.count(),
        this.prisma.vehicle.groupBy({
          by: ['fuelType'],
          _count: { fuelType: true },
        }),
        this.prisma.vehicle.groupBy({
          by: ['condition'],
          _count: { condition: true },
        }),
        this.prisma.vehicle.aggregate({
          _avg: { reservePrice: true },
          _min: { reservePrice: true },
          _max: { reservePrice: true },
        }),
      ]);

    return {
      totalVehicles,
      vehiclesByFuelType: vehiclesByFuelType.map((item) => ({
        fuelType: item.fuelType,
        count: item._count.fuelType,
      })),
      vehiclesByCondition: vehiclesByCondition.map((item) => ({
        condition: item.condition,
        count: item._count.condition,
      })),
      priceStats: {
        average: priceStats._avg.reservePrice,
        minimum: priceStats._min.reservePrice,
        maximum: priceStats._max.reservePrice,
      },
    };
  }
}