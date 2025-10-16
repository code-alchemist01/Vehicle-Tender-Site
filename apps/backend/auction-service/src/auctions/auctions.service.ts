import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { PlaceBidDto } from './dto/place-bid.dto';
import { AuctionQueryDto, AuctionStatus } from './dto/auction-query.dto';
import { Auction, Bid, AuctionStatus as PrismaAuctionStatus } from '@prisma/client';

@Injectable()
export class AuctionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAuctionDto: CreateAuctionDto): Promise<Auction> {
    const { startTime, endTime, startingPrice, ...rest } = createAuctionDto;

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start <= now) {
      throw new BadRequestException('Start time must be in the future');
    }

    if (end <= start) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check if vehicle is already in an active auction
    const existingAuction = await this.prisma.auction.findFirst({
      where: {
        vehicleId: createAuctionDto.vehicleId,
        status: {
          in: [PrismaAuctionStatus.SCHEDULED, PrismaAuctionStatus.ACTIVE, PrismaAuctionStatus.EXTENDED],
        },
      },
    });

    if (existingAuction) {
      throw new ConflictException('Vehicle is already in an active auction');
    }

    return this.prisma.auction.create({
      data: {
        ...rest,
        startTime: start,
        endTime: end,
        startingPrice,
        currentPrice: startingPrice,
        status: start <= now ? PrismaAuctionStatus.ACTIVE : PrismaAuctionStatus.SCHEDULED,
        isActive: start <= now && end > now,
      },
    });
  }

  async findAll(query: AuctionQueryDto) {
    const { page, limit, search, status, sellerId, vehicleId, isFeatured, isActive, minPrice, maxPrice, sortBy, sortOrder } = query;
    
    const skip = (page - 1) * limit;
    
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (sellerId) where.sellerId = sellerId;
    if (vehicleId) where.vehicleId = vehicleId;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isActive !== undefined) where.isActive = isActive;
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.currentPrice = {};
      if (minPrice !== undefined) where.currentPrice.gte = minPrice;
      if (maxPrice !== undefined) where.currentPrice.lte = maxPrice;
    }

    const [auctions, total] = await Promise.all([
      this.prisma.auction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          bids: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              bids: true,
              watchlists: true,
            },
          },
        },
      }),
      this.prisma.auction.count({ where }),
    ]);

    return {
      data: auctions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Auction & { bids: Bid[] }> {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: {
        bids: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            bids: true,
            watchlists: true,
          },
        },
      },
    });

    if (!auction) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }

    // Increment view count
    await this.prisma.auction.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return auction;
  }

  async update(id: string, updateAuctionDto: UpdateAuctionDto): Promise<Auction> {
    const auction = await this.findOne(id);

    // Prevent updates to active auctions with bids
    if (auction.status === PrismaAuctionStatus.ACTIVE && auction.totalBids > 0) {
      throw new BadRequestException('Cannot update auction with existing bids');
    }

    return this.prisma.auction.update({
      where: { id },
      data: updateAuctionDto,
    });
  }

  async remove(id: string): Promise<void> {
    const auction = await this.findOne(id);

    // Prevent deletion of active auctions with bids
    if (auction.status === PrismaAuctionStatus.ACTIVE && auction.totalBids > 0) {
      throw new BadRequestException('Cannot delete auction with existing bids');
    }

    await this.prisma.auction.delete({
      where: { id },
    });
  }

  async placeBid(placeBidDto: PlaceBidDto): Promise<Bid> {
    const { auctionId, bidderId, amount, isAutomatic, maxAmount } = placeBidDto;

    const auction = await this.findOne(auctionId);

    // Validate auction status
    if (auction.status !== PrismaAuctionStatus.ACTIVE) {
      throw new BadRequestException('Auction is not active');
    }

    // Check if auction has ended
    if (new Date() > auction.endTime) {
      throw new BadRequestException('Auction has ended');
    }

    // Validate bid amount
    const minBidAmount = auction.currentPrice.toNumber() + auction.minBidIncrement.toNumber();
    if (amount < minBidAmount) {
      throw new BadRequestException(`Minimum bid amount is ${minBidAmount}`);
    }

    // Prevent seller from bidding on their own auction
    if (bidderId === auction.sellerId) {
      throw new BadRequestException('Seller cannot bid on their own auction');
    }

    // Check if user is already the highest bidder
    if (auction.highestBidderId === bidderId) {
      throw new BadRequestException('You are already the highest bidder');
    }

    return this.prisma.$transaction(async (tx) => {
      // Mark previous winning bid as not winning
      if (auction.highestBidderId) {
        await tx.bid.updateMany({
          where: {
            auctionId,
            isWinning: true,
          },
          data: { isWinning: false },
        });
      }

      // Create new bid
      const bid = await tx.bid.create({
        data: {
          auctionId,
          bidderId,
          amount,
          isAutomatic: isAutomatic || false,
          maxAmount,
          isWinning: true,
        },
      });

      // Update auction
      const now = new Date();
      const timeUntilEnd = auction.endTime.getTime() - now.getTime();
      const shouldExtend = timeUntilEnd < (auction.autoExtendMinutes * 60 * 1000);

      const updateData: any = {
        currentPrice: amount,
        highestBidderId: bidderId,
        totalBids: { increment: 1 },
      };

      if (shouldExtend) {
        const newEndTime = new Date(now.getTime() + (auction.autoExtendMinutes * 60 * 1000));
        updateData.extendedEndTime = newEndTime;
        updateData.status = PrismaAuctionStatus.EXTENDED;
      }

      await tx.auction.update({
        where: { id: auctionId },
        data: updateData,
      });

      return bid;
    });
  }

  async addToWatchlist(auctionId: string, userId: string) {
    const auction = await this.findOne(auctionId);

    try {
      const watchlist = await this.prisma.watchlist.create({
        data: {
          auctionId,
          userId,
        },
      });

      // Update watchlist count
      await this.prisma.auction.update({
        where: { id: auctionId },
        data: { watchlistCount: { increment: 1 } },
      });

      return watchlist;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Auction is already in watchlist');
      }
      throw error;
    }
  }

  async removeFromWatchlist(auctionId: string, userId: string) {
    const watchlist = await this.prisma.watchlist.findUnique({
      where: {
        auctionId_userId: {
          auctionId,
          userId,
        },
      },
    });

    if (!watchlist) {
      throw new NotFoundException('Auction not found in watchlist');
    }

    await this.prisma.watchlist.delete({
      where: {
        auctionId_userId: {
          auctionId,
          userId,
        },
      },
    });

    // Update watchlist count
    await this.prisma.auction.update({
      where: { id: auctionId },
      data: { watchlistCount: { decrement: 1 } },
    });
  }

  // Scheduled task to update auction statuses
  @Cron(CronExpression.EVERY_MINUTE)
  async updateAuctionStatuses() {
    const now = new Date();
    console.log(`🕐 Current time: ${now.toISOString()}`);

    // Start scheduled auctions
    const startedAuctions = await this.prisma.auction.updateMany({
      where: {
        status: PrismaAuctionStatus.SCHEDULED,
        startTime: { lte: now },
      },
      data: {
        status: PrismaAuctionStatus.ACTIVE,
        isActive: true,
      },
    });

    // End active auctions
    const endedAuctions = await this.prisma.auction.updateMany({
      where: {
        status: { in: [PrismaAuctionStatus.ACTIVE, PrismaAuctionStatus.EXTENDED] },
        OR: [
          { endTime: { lte: now } },
          { extendedEndTime: { lte: now } },
        ],
      },
      data: {
        status: PrismaAuctionStatus.ENDED,
        isActive: false,
      },
    });

    console.log(`🔄 Auction statuses updated at ${now.toISOString()} - Started: ${startedAuctions.count}, Ended: ${endedAuctions.count}`);
  }

  // Manual method to update auction statuses for testing
  async manualUpdateAuctionStatuses() {
    return this.updateAuctionStatuses();
  }

  async getAuctionStats() {
    const [total, active, scheduled, ended] = await Promise.all([
      this.prisma.auction.count(),
      this.prisma.auction.count({ where: { status: PrismaAuctionStatus.ACTIVE } }),
      this.prisma.auction.count({ where: { status: PrismaAuctionStatus.SCHEDULED } }),
      this.prisma.auction.count({ where: { status: PrismaAuctionStatus.ENDED } }),
    ]);

    return {
      total,
      active,
      scheduled,
      ended,
    };
  }
}