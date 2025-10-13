import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { PaginationDto, PaginationMetaDto, PaginatedResponseDto } from '@/common/dto/pagination.dto';
import { AuctionStatus } from '@prisma/client';

interface BidFilters {
  auctionId?: string;
  userId?: string;
  amountFrom?: number;
  amountTo?: number;
}

const BidSelect = {
  id: true,
  amount: true,
  createdAt: true,
  userId: true,
  auctionId: true,
  auction: {
    select: {
      id: true,
      title: true,
      status: true,
      endTime: true,
      vehicle: {
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
        },
      },
    },
  },
};

@Injectable()
export class BidsService {
  constructor(private prisma: PrismaService) {}

  async create(createBidDto: CreateBidDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Get auction with vehicle details
      const auction = await tx.auction.findUnique({
        where: { id: createBidDto.auctionId },
        include: {
          vehicle: true,
          bids: {
            orderBy: { amount: 'desc' },
            take: 1,
          },
        },
      });

      if (!auction) {
        throw new NotFoundException('Auction not found');
      }

      // Check if auction is active
      if (auction.status !== AuctionStatus.ACTIVE) {
        throw new BadRequestException('Auction is not active');
      }

      // Check if auction has started and not ended
      const now = new Date();
      if (now < auction.startTime) {
        throw new BadRequestException('Auction has not started yet');
      }

      if (now > auction.endTime) {
        throw new BadRequestException('Auction has ended');
      }

      // Check if user is not the vehicle owner
      if (auction.vehicle.userId === userId) {
        throw new ForbiddenException('You cannot bid on your own vehicle');
      }

      // Validate bid amount - must be higher than current bid
      const minBidAmount = auction.currentBid + 100; // Minimum increment of 100
      if (createBidDto.amount < minBidAmount) {
        throw new BadRequestException(`Bid amount must be at least ${minBidAmount}`);
      }

      // Check if user already has a higher bid
      const userHighestBid = await tx.bid.findFirst({
        where: {
          auctionId: createBidDto.auctionId,
          userId: userId,
        },
        orderBy: { amount: 'desc' },
      });

      if (userHighestBid && userHighestBid.amount >= createBidDto.amount) {
        throw new BadRequestException('You already have a higher or equal bid on this auction');
      }

      // Create the bid
      const bid = await tx.bid.create({
        data: {
          auctionId: createBidDto.auctionId,
          userId: userId,
          amount: createBidDto.amount,
        },
        include: {
          auction: {
            include: {
              vehicle: true,
            },
          },
        },
      });

      // Update auction's current bid
      await tx.auction.update({
        where: { id: createBidDto.auctionId },
        data: {
          currentBid: createBidDto.amount,
        },
      });

      // Note: Buy now functionality removed as it's not in the current schema

      return bid;
    });
  }

  async findAll(
    paginationDto: PaginationDto,
    filters: BidFilters = {},
  ): Promise<PaginatedResponseDto<any>> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: any = {};

    if (filters.auctionId) {
      where.auctionId = filters.auctionId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.amountFrom || filters.amountTo) {
      where.amount = {};
      if (filters.amountFrom) where.amount.gte = filters.amountFrom;
      if (filters.amountTo) where.amount.lte = filters.amountTo;
    }

    const [bids, total] = await Promise.all([
      this.prisma.bid.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          auction: {
            include: {
              vehicle: {
                select: {
                  id: true,
                  make: true,
                  model: true,
                  year: true,
                  images: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.bid.count({ where }),
    ]);

    const meta = new PaginationMetaDto(page, limit, total);
    return new PaginatedResponseDto(bids, meta);
  }

  async findByAuction(
    auctionId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<any>> {
    return this.findAll(paginationDto, { auctionId });
  }

  async findByUser(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<any>> {
    return this.findAll(paginationDto, { userId });
  }

  async findOne(id: string) {
    const bid = await this.prisma.bid.findUnique({
      where: { id },
      include: {
        auction: {
          include: {
            vehicle: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    return bid;
  }

  async update(id: string, updateBidDto: UpdateBidDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const bid = await tx.bid.findUnique({
        where: { id },
        include: {
          auction: true,
        },
      });

      if (!bid) {
        throw new NotFoundException('Bid not found');
      }

      // Check if user owns the bid
      if (bid.userId !== userId) {
        throw new ForbiddenException('You can only update your own bids');
      }

      // Check if auction is still active
      if (bid.auction.status !== AuctionStatus.ACTIVE) {
        throw new BadRequestException('Cannot update bid on inactive auction');
      }

      // Check if auction has not ended
      const now = new Date();
      if (now > bid.auction.endTime) {
        throw new BadRequestException('Cannot update bid on ended auction');
      }

      // Only allow updating amount for now
      // Amount updates require validation and re-checking of auction state
      const allowedUpdates: Partial<UpdateBidDto> = {};
      if (updateBidDto.amount !== undefined) {
        // Validate new bid amount
        const minBidAmount = bid.auction.currentBid + 100;
        if (updateBidDto.amount < minBidAmount) {
          throw new BadRequestException(`Bid amount must be at least ${minBidAmount}`);
        }
        allowedUpdates.amount = updateBidDto.amount;
      }

      return tx.bid.update({
        where: { id },
        data: allowedUpdates,
        include: {
          auction: {
            include: {
              vehicle: true,
            },
          },
        },
      });
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const bid = await tx.bid.findUnique({
        where: { id },
        include: {
          auction: true,
        },
      });

      if (!bid) {
        throw new NotFoundException('Bid not found');
      }

      // Check if user owns the bid
      if (bid.userId !== userId) {
        throw new ForbiddenException('You can only delete your own bids');
      }

      // Check if auction is still active and hasn't started
      if (bid.auction.status !== AuctionStatus.DRAFT) {
        throw new BadRequestException('Cannot delete bid from active or ended auction');
      }

      return tx.bid.delete({
        where: { id },
      });
    });
  }

  async getHighestBidForAuction(auctionId: string) {
    const highestBid = await this.prisma.bid.findFirst({
      where: { auctionId },
      orderBy: { amount: 'desc' },
      include: {
        auction: {
          include: {
            vehicle: true,
          },
        },
      },
    });

    return highestBid;
  }

  async getUserBidsForAuction(auctionId: string, userId: string) {
    return this.prisma.bid.findMany({
      where: {
        auctionId,
        userId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        auction: {
          include: {
            vehicle: true,
          },
        },
      },
    });
  }

  async getBidHistory(auctionId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [bids, total] = await Promise.all([
      this.prisma.bid.findMany({
        where: { auctionId },
        skip,
        take: limit,
        orderBy: { amount: 'desc' },
        select: {
          id: true,
          amount: true,
          createdAt: true,
          userId: true, // You might want to exclude this for privacy
        },
      }),
      this.prisma.bid.count({ where: { auctionId } }),
    ]);

    const meta = new PaginationMetaDto(page, limit, total);
    return new PaginatedResponseDto(bids, meta);
  }

  async getWinningBids(userId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    // Get auctions where user has the highest bid and auction is ended
    const winningBids = await this.prisma.$queryRaw`
      SELECT DISTINCT b.*, a.*, v.make, v.model, v.year, v.images
      FROM "Bid" b
      INNER JOIN "Auction" a ON b."auctionId" = a.id
      INNER JOIN "Vehicle" v ON a."vehicleId" = v.id
      WHERE b."userId" = ${userId}
        AND a.status = 'ENDED'
        AND b.amount = (
          SELECT MAX(b2.amount)
          FROM "Bid" b2
          WHERE b2."auctionId" = a.id
        )
      ORDER BY b."createdAt" DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const totalQuery = await this.prisma.$queryRaw`
      SELECT COUNT(DISTINCT b.id) as count
      FROM "Bid" b
      INNER JOIN "Auction" a ON b."auctionId" = a.id
      WHERE b."userId" = ${userId}
        AND a.status = 'ENDED'
        AND b.amount = (
          SELECT MAX(b2.amount)
          FROM "Bid" b2
          WHERE b2."auctionId" = a.id
        )
    `;

    const total = Number((totalQuery as any)[0]?.count || 0);
    const meta = new PaginationMetaDto(page, limit, total);
    return new PaginatedResponseDto(winningBids as any[], meta);
  }
}