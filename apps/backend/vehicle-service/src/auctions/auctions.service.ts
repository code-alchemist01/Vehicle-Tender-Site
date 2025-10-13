import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { PaginationDto, PaginationMetaDto, PaginatedResponseDto } from '@/common/dto/pagination.dto';
import { AuctionStatus, VehicleStatus } from '@prisma/client';

interface AuctionFilters {
  status?: AuctionStatus;
  vehicleId?: string;
  startPriceFrom?: number;
  startPriceTo?: number;
  currentPriceFrom?: number;
  currentPriceTo?: number;
  startTimeFrom?: string;
  startTimeTo?: string;
  endTimeFrom?: string;
  endTimeTo?: string;
}

@Injectable()
export class AuctionsService {
  constructor(private prisma: PrismaService) {}

  async create(createAuctionDto: CreateAuctionDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Verify vehicle exists and belongs to user
      const vehicle = await tx.vehicle.findUnique({
        where: { id: createAuctionDto.vehicleId },
      });

      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }

      if (vehicle.userId !== userId) {
        throw new ForbiddenException('You can only create auctions for your own vehicles');
      }

      // Check if vehicle is in appropriate status
      if (vehicle.status !== VehicleStatus.ACTIVE) {
        throw new BadRequestException('Vehicle must be active to create an auction');
      }

      // Check if there's already an active auction for this vehicle
      const existingAuction = await tx.auction.findFirst({
        where: {
          vehicleId: createAuctionDto.vehicleId,
          status: { in: [AuctionStatus.DRAFT, AuctionStatus.ACTIVE] },
        },
      });

      if (existingAuction) {
        throw new BadRequestException('Vehicle already has an active auction');
      }

      // Validate auction times
      const startTime = new Date(createAuctionDto.startTime);
      const endTime = new Date(createAuctionDto.endTime);
      const now = new Date();

      if (startTime <= now) {
        throw new BadRequestException('Auction start time must be in the future');
      }

      if (endTime <= startTime) {
        throw new BadRequestException('Auction end time must be after start time');
      }

      // Validate prices
      if (createAuctionDto.reservePrice && createAuctionDto.reservePrice < createAuctionDto.startPrice) {
        throw new BadRequestException('Reserve price cannot be less than starting price');
      }

      return tx.auction.create({
        data: {
          vehicleId: createAuctionDto.vehicleId,
          title: createAuctionDto.title,
          description: createAuctionDto.description,
          startPrice: createAuctionDto.startPrice,
          reservePrice: createAuctionDto.reservePrice,
          currentBid: createAuctionDto.currentBid || createAuctionDto.startPrice,
          startTime: startTime,
          endTime: endTime,
          status: createAuctionDto.status || AuctionStatus.DRAFT,
          userId: userId,
        },
        include: {
          vehicle: {
            include: {
              category: true,
            },
          },
          bids: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });
    });
  }

  async findAll(
    paginationDto: PaginationDto,
    filters: AuctionFilters = {},
  ): Promise<PaginatedResponseDto<any>> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    } else {
      // Default to show only active auctions for public access
      where.status = { in: [AuctionStatus.ACTIVE] };
    }

    if (filters.vehicleId) {
      where.vehicleId = filters.vehicleId;
    }

    if (filters.startPriceFrom || filters.startPriceTo) {
      where.startPrice = {};
      if (filters.startPriceFrom) where.startPrice.gte = filters.startPriceFrom;
      if (filters.startPriceTo) where.startPrice.lte = filters.startPriceTo;
    }

    if (filters.currentPriceFrom || filters.currentPriceTo) {
      where.currentBid = {};
      if (filters.currentPriceFrom) where.currentBid.gte = filters.currentPriceFrom;
      if (filters.currentPriceTo) where.currentBid.lte = filters.currentPriceTo;
    }

    if (filters.startTimeFrom || filters.startTimeTo) {
      where.startTime = {};
      if (filters.startTimeFrom) where.startTime.gte = new Date(filters.startTimeFrom);
      if (filters.startTimeTo) where.startTime.lte = new Date(filters.startTimeTo);
    }

    if (filters.endTimeFrom || filters.endTimeTo) {
      where.endTime = {};
      if (filters.endTimeFrom) where.endTime.gte = new Date(filters.endTimeFrom);
      if (filters.endTimeTo) where.endTime.lte = new Date(filters.endTimeTo);
    }

    const [auctions, total] = await Promise.all([
      this.prisma.auction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: {
            include: {
              category: true,
            },
          },
          bids: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      }),
      this.prisma.auction.count({ where }),
    ]);

    const meta = new PaginationMetaDto(page, limit, total);
    return new PaginatedResponseDto(auctions, meta);
  }

  async findByUser(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<any>> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [auctions, total] = await Promise.all([
      this.prisma.auction.findMany({
        where: {
          vehicle: {
            userId: userId,
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: {
            include: {
              category: true,
            },
          },
          bids: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      }),
      this.prisma.auction.count({
        where: {
          vehicle: {
            userId: userId,
          },
        },
      }),
    ]);

    const meta = new PaginationMetaDto(page, limit, total);
    return new PaginatedResponseDto(auctions, meta);
  }

  async findOne(id: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: {
        vehicle: {
          include: {
            category: true,
          },
        },
        bids: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    return auction;
  }

  async update(id: string, updateAuctionDto: UpdateAuctionDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id },
        include: {
          vehicle: true,
        },
      });

      if (!auction) {
        throw new NotFoundException('Auction not found');
      }

      // Check if user owns the vehicle
      if (auction.vehicle.userId !== userId) {
        throw new ForbiddenException('You can only update your own auctions');
      }

      // Prevent updates to active auctions with bids
      if (auction.status === AuctionStatus.ACTIVE) {
        const bidCount = await tx.bid.count({
          where: { auctionId: id },
        });

        if (bidCount > 0) {
          throw new BadRequestException('Cannot update auction that has bids');
        }
      }

      // Validate auction times if being updated
      if (updateAuctionDto.startTime || updateAuctionDto.endTime) {
        const startTime = updateAuctionDto.startTime ? new Date(updateAuctionDto.startTime) : auction.startTime;
        const endTime = updateAuctionDto.endTime ? new Date(updateAuctionDto.endTime) : auction.endTime;

        if (endTime <= startTime) {
          throw new BadRequestException('Auction end time must be after start time');
        }
      }

      return tx.auction.update({
        where: { id },
        data: updateAuctionDto,
        include: {
          vehicle: {
            include: {
              category: true,
            },
          },
          bids: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id },
        include: {
          vehicle: true,
        },
      });

      if (!auction) {
        throw new NotFoundException('Auction not found');
      }

      // Check if user owns the vehicle
      if (auction.vehicle.userId !== userId) {
        throw new ForbiddenException('You can only delete your own auctions');
      }

      // Prevent deletion of active auctions with bids
      if (auction.status === AuctionStatus.ACTIVE) {
        const bidCount = await tx.bid.count({
          where: { auctionId: id },
        });

        if (bidCount > 0) {
          throw new BadRequestException('Cannot delete auction that has bids');
        }
      }

      return tx.auction.delete({
        where: { id },
      });
    });
  }

  async updateStatus(id: string, status: AuctionStatus, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id },
        include: {
          vehicle: true,
        },
      });

      if (!auction) {
        throw new NotFoundException('Auction not found');
      }

      // Check if user owns the vehicle
      if (auction.vehicle.userId !== userId) {
        throw new ForbiddenException('You can only update your own auctions');
      }

      // Validate status transitions
      if (auction.status === AuctionStatus.ENDED && status !== AuctionStatus.ENDED) {
        throw new BadRequestException('Cannot change status of ended auction');
      }

      if (auction.status === AuctionStatus.CANCELLED && status !== AuctionStatus.CANCELLED) {
        throw new BadRequestException('Cannot change status of cancelled auction');
      }

      return tx.auction.update({
        where: { id },
        data: { status },
        include: {
          vehicle: {
            include: {
              category: true,
            },
          },
          bids: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });
    });
  }

  async getActiveAuctions(paginationDto: PaginationDto): Promise<PaginatedResponseDto<any>> {
    return this.findAll(paginationDto, { status: AuctionStatus.ACTIVE });
  }

  async getEndingSoon(hours: number = 24, paginationDto: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + hours);

    return this.findAll(paginationDto, {
      status: AuctionStatus.ACTIVE,
      endTimeTo: endTime.toISOString(),
    });
  }
}