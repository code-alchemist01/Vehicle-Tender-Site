import { Request, Response } from 'express';
import { prisma } from '../database/connection';
import { logger } from '../common/utils/logger';
import { asyncHandler, CustomError } from '../common/middleware/error.middleware';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export class VehicleController {
  // Get all vehicles with pagination and filtering
  getAllVehicles = asyncHandler(async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      brand,
      model,
      year,
      fuelType,
      transmission,
      condition,
      status,
      minPrice,
      maxPrice,
      search
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = {};

    if (brand) where.brand = { contains: brand as string, mode: 'insensitive' };
    if (model) where.model = { contains: model as string, mode: 'insensitive' };
    if (year) where.year = Number(year);
    if (fuelType) where.fuelType = fuelType as string;
    if (transmission) where.transmission = transmission as string;
    if (condition) where.condition = condition as string;
    if (status) where.status = status as string;
    
    if (minPrice || maxPrice) {
      where.reservePrice = {};
      if (minPrice) where.reservePrice.gte = Number(minPrice);
      if (maxPrice) where.reservePrice.lte = Number(maxPrice);
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { brand: { contains: search as string, mode: 'insensitive' } },
        { model: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.vehicle.count({ where })
    ]);

    // Parse images JSON for each vehicle
    const vehiclesWithImages = vehicles.map(vehicle => ({
      ...vehicle,
      images: JSON.parse(vehicle.images || '[]')
    }));

    res.json({
      success: true,
      data: {
        vehicles: vehiclesWithImages,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  });

  // Get vehicle by ID
  getVehicleById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!vehicle) {
      throw new CustomError('Vehicle not found', 404);
    }

    // Parse images JSON
    const vehicleWithImages = {
      ...vehicle,
      images: JSON.parse(vehicle.images || '[]')
    };

    res.json({
      success: true,
      data: vehicleWithImages
    });
  });

  // Create new vehicle
  createVehicle = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      title,
      description,
      brand,
      model,
      year,
      mileage,
      fuelType,
      transmission,
      condition,
      reservePrice,
      images = []
    } = req.body;

    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        title,
        description,
        brand,
        model,
        year: Number(year),
        mileage: mileage ? Number(mileage) : null,
        fuelType,
        transmission,
        condition,
        reservePrice: reservePrice ? Number(reservePrice) : null,
        images: JSON.stringify(images),
        userId: req.user.id,
        status: 'DRAFT'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    logger.info(`Vehicle created: ${vehicle.id} by user: ${req.user.id}`);

    res.status(201).json({
      success: true,
      data: {
        ...vehicle,
        images: JSON.parse(vehicle.images || '[]')
      }
    });
  });

  // Update vehicle
  updateVehicle = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const {
      title,
      description,
      brand,
      model,
      year,
      mileage,
      fuelType,
      transmission,
      condition,
      reservePrice,
      images,
      status
    } = req.body;

    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    // Check if vehicle exists and belongs to user
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id }
    });

    if (!existingVehicle) {
      throw new CustomError('Vehicle not found', 404);
    }

    if (existingVehicle.userId !== req.user.id) {
      throw new CustomError('Not authorized to update this vehicle', 403);
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (brand !== undefined) updateData.brand = brand;
    if (model !== undefined) updateData.model = model;
    if (year !== undefined) updateData.year = Number(year);
    if (mileage !== undefined) updateData.mileage = mileage ? Number(mileage) : null;
    if (fuelType !== undefined) updateData.fuelType = fuelType;
    if (transmission !== undefined) updateData.transmission = transmission;
    if (condition !== undefined) updateData.condition = condition;
    if (reservePrice !== undefined) updateData.reservePrice = reservePrice ? Number(reservePrice) : null;
    if (images !== undefined) updateData.images = JSON.stringify(images);
    if (status !== undefined) updateData.status = status;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    logger.info(`Vehicle updated: ${vehicle.id} by user: ${req.user.id}`);

    res.json({
      success: true,
      data: {
        ...vehicle,
        images: JSON.parse(vehicle.images || '[]')
      }
    });
  });

  // Delete vehicle
  deleteVehicle = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    // Check if vehicle exists and belongs to user
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id }
    });

    if (!existingVehicle) {
      throw new CustomError('Vehicle not found', 404);
    }

    if (existingVehicle.userId !== req.user.id) {
      throw new CustomError('Not authorized to delete this vehicle', 403);
    }

    await prisma.vehicle.delete({
      where: { id }
    });

    logger.info(`Vehicle deleted: ${id} by user: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  });

  // Get user's vehicles
  getUserVehicles = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { page = 1, limit = 10, status } = req.query;

    if (!req.user) {
      throw new CustomError('Authentication required', 401);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { userId: req.user.id };
    if (status) where.status = status as string;

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.vehicle.count({ where })
    ]);

    // Parse images JSON for each vehicle
    const vehiclesWithImages = vehicles.map(vehicle => ({
      ...vehicle,
      images: JSON.parse(vehicle.images || '[]')
    }));

    res.json({
      success: true,
      data: {
        vehicles: vehiclesWithImages,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  });

  // Get vehicle statistics
  getVehicleStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await prisma.vehicle.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const brandStats = await prisma.vehicle.groupBy({
      by: ['brand'],
      _count: {
        brand: true
      },
      orderBy: {
        _count: {
          brand: 'desc'
        }
      },
      take: 10
    });

    res.json({
      success: true,
      data: {
        statusStats: stats,
        topBrands: brandStats
      }
    });
  });
}