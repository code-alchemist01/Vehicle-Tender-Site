import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleFilterDto } from './dto/vehicle-filter.dto';
import { PaginationDto, PaginationMetaDto, PaginatedResponseDto } from '@/common/dto/pagination.dto';
import { VehicleStatus, FuelType, TransmissionType, VehicleCondition } from '@prisma/client';



@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto, userId: string) {
    // Validate business rules
    this.validateVehicleData(createVehicleDto);

    return this.prisma.$transaction(async (tx) => {
      // Verify category exists
      const category = await tx.category.findUnique({
        where: { id: createVehicleDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      // Check if VIN already exists (if provided)
      if (createVehicleDto.vin) {
        const existingVehicle = await tx.vehicle.findFirst({
          where: { vin: createVehicleDto.vin },
        });

        if (existingVehicle) {
          throw new ForbiddenException('Vehicle with this VIN already exists');
        }
      }

      // Check if license plate already exists (if provided)
      if (createVehicleDto.licensePlate) {
        const existingPlate = await tx.vehicle.findFirst({
          where: { licensePlate: createVehicleDto.licensePlate },
        });

        if (existingPlate) {
          throw new ForbiddenException('Vehicle with this license plate already exists');
        }
      }

      return tx.vehicle.create({
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
          location: createVehicleDto.location,
          vin: createVehicleDto.vin,
          licensePlate: createVehicleDto.licensePlate,
        },
        include: {
          category: true,
        },
      });
    });
  }

  async findAll(
    filters: VehicleFilterDto,
  ): Promise<PaginatedResponseDto<any>> {
    const { page, limit, ...filterOptions } = filters;
    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: any = {};

    if (filterOptions.make) {
      where.make = { contains: filterOptions.make, mode: 'insensitive' };
    }

    if (filterOptions.model) {
      where.model = { contains: filterOptions.model, mode: 'insensitive' };
    }

    if (filterOptions.yearFrom || filterOptions.yearTo) {
      where.year = {};
      if (filterOptions.yearFrom) where.year.gte = filterOptions.yearFrom;
      if (filterOptions.yearTo) where.year.lte = filterOptions.yearTo;
    }

    if (filterOptions.mileageFrom || filterOptions.mileageTo) {
      where.mileage = {};
      if (filterOptions.mileageFrom) where.mileage.gte = filterOptions.mileageFrom;
      if (filterOptions.mileageTo) where.mileage.lte = filterOptions.mileageTo;
    }

    // Note: Price filtering removed as estimatedValue field doesn't exist in schema
    // Consider adding price filtering through auction data if needed

    if (filterOptions.fuelType) {
      where.fuelType = filterOptions.fuelType;
    }

    if (filterOptions.transmission) {
      where.transmission = filterOptions.transmission;
    }

    if (filterOptions.condition) {
      where.condition = filterOptions.condition;
    }

    if (filterOptions.categoryId) {
      where.categoryId = filterOptions.categoryId;
    }

    if (filterOptions.location) {
      where.location = { contains: filterOptions.location, mode: 'insensitive' };
    }

    if (filterOptions.status) {
      where.status = filterOptions.status;
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

  private validateVehicleData(vehicleDto: CreateVehicleDto | UpdateVehicleDto): void {
    const currentYear = new Date().getFullYear();
    
    // Validate year is not in the future
    if (vehicleDto.year && vehicleDto.year > currentYear + 1) {
      throw new BadRequestException('Vehicle year cannot be more than one year in the future');
    }

    // Validate mileage is reasonable for the year
    if (vehicleDto.year && vehicleDto.mileage) {
      const vehicleAge = currentYear - vehicleDto.year;
      const maxReasonableMileage = vehicleAge * 50000; // 50k km per year max
      
      if (vehicleDto.mileage > maxReasonableMileage && vehicleAge > 0) {
        throw new BadRequestException(
          `Mileage seems unreasonably high for a ${vehicleDto.year} vehicle. Maximum expected: ${maxReasonableMileage} km`
        );
      }
    }

    // Validate engine size for fuel type
    if (vehicleDto.engineSize && vehicleDto.fuelType === FuelType.ELECTRIC && vehicleDto.engineSize > 0) {
      throw new BadRequestException('Electric vehicles should not have engine size specified');
    }

    // Validate images array
    if (vehicleDto.images && vehicleDto.images.length > 10) {
      throw new BadRequestException('Maximum 10 images allowed per vehicle');
    }
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

  async search(
    query: string,
    paginationDto: PaginationDto,
    filters: VehicleFilterDto = {},
  ): Promise<PaginatedResponseDto<any>> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    // Build search conditions
    const searchConditions = query
      ? {
          OR: [
            { make: { contains: query, mode: 'insensitive' } },
            { model: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } },
            { category: { name: { contains: query, mode: 'insensitive' } } },
          ],
        }
      : {};

    // Build filter conditions
    const filterConditions: any = {};

    if (filters.make) {
      filterConditions.make = { contains: filters.make, mode: 'insensitive' };
    }

    if (filters.model) {
      filterConditions.model = { contains: filters.model, mode: 'insensitive' };
    }

    if (filters.yearFrom || filters.yearTo) {
      filterConditions.year = {};
      if (filters.yearFrom) filterConditions.year.gte = filters.yearFrom;
      if (filters.yearTo) filterConditions.year.lte = filters.yearTo;
    }

    if (filters.mileageFrom || filters.mileageTo) {
      filterConditions.mileage = {};
      if (filters.mileageFrom) filterConditions.mileage.gte = filters.mileageFrom;
      if (filters.mileageTo) filterConditions.mileage.lte = filters.mileageTo;
    }

    if (filters.fuelType) {
      filterConditions.fuelType = filters.fuelType;
    }

    if (filters.transmission) {
      filterConditions.transmission = filters.transmission;
    }

    if (filters.condition) {
      filterConditions.condition = filters.condition;
    }

    if (filters.categoryId) {
      filterConditions.categoryId = filters.categoryId;
    }

    if (filters.location) {
      filterConditions.location = { contains: filters.location, mode: 'insensitive' };
    }

    if (filters.status) {
      filterConditions.status = filters.status;
    } else {
      // Default to only show active vehicles
      filterConditions.status = { in: [VehicleStatus.ACTIVE] };
    }

    // Combine search and filter conditions
    const where = {
      ...searchConditions,
      ...filterConditions,
    };

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { createdAt: 'desc' },
        ],
        include: {
          category: true,
        },
      }),
      this.prisma.vehicle.count({ where }),
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
    // Validate business rules
    this.validateVehicleData(updateVehicleDto);

    return this.prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({
        where: { id },
        include: { category: true },
      });

      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }

      // Check if user owns the vehicle
      if (vehicle.userId !== userId) {
        throw new ForbiddenException('You can only update your own vehicles');
      }

      // Verify category exists if being updated
      if (updateVehicleDto.categoryId) {
        const category = await tx.category.findUnique({
          where: { id: updateVehicleDto.categoryId },
        });

        if (!category) {
          throw new NotFoundException('Category not found');
        }
      }

      // Check if VIN already exists (if being updated and different from current)
      if (updateVehicleDto.vin && updateVehicleDto.vin !== vehicle.vin) {
        const existingVehicle = await tx.vehicle.findFirst({
          where: { 
            vin: updateVehicleDto.vin,
            id: { not: id }
          },
        });

        if (existingVehicle) {
          throw new ForbiddenException('Vehicle with this VIN already exists');
        }
      }

      // Check if license plate already exists (if being updated and different from current)
      if (updateVehicleDto.licensePlate && updateVehicleDto.licensePlate !== vehicle.licensePlate) {
        const existingPlate = await tx.vehicle.findFirst({
          where: { 
            licensePlate: updateVehicleDto.licensePlate,
            id: { not: id }
          },
        });

        if (existingPlate) {
          throw new ForbiddenException('Vehicle with this license plate already exists');
        }
      }

      return tx.vehicle.update({
        where: { id },
        data: updateVehicleDto,
        include: {
          category: true,
        },
      });
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