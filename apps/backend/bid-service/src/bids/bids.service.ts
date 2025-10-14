import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../database/prisma.service';
import { BidValidationService } from './bid-validation.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { BidQueryDto } from './dto/bid-query.dto';

@Injectable()
export class BidsService {
  constructor(
    private prisma: PrismaService,
    private bidValidationService: BidValidationService,
    @InjectQueue('bid-processing') private bidQueue: Queue,
  ) {}

  async createBid(createBidDto: CreateBidDto) {
    // Validate bid
    await this.bidValidationService.validateBid(createBidDto);

    // Create bid with pending status
    const bid = await this.prisma.bid.create({
      data: {
        auctionId: createBidDto.auctionId,
        bidderId: createBidDto.bidderId,
        amount: createBidDto.amount,
        status: 'PENDING',
        placedAt: new Date(),
      },
    });

    // Add to processing queue
    await this.bidQueue.add('process-bid', { bidId: bid.id }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    return bid;
  }

  async getBids(query: BidQueryDto) {
    const { page = 1, limit = 10, auctionId, bidderId, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (auctionId) where.auctionId = auctionId;
    if (bidderId) where.bidderId = bidderId;
    if (status) where.status = status;

    const [bids, total] = await Promise.all([
      this.prisma.bid.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          placedAt: 'desc',
        },
      }),
      this.prisma.bid.count({ where }),
    ]);

    return {
      data: bids,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBidById(id: string) {
    const bid = await this.prisma.bid.findUnique({
      where: { id },

    });

    if (!bid) {
      throw new NotFoundException(`Bid with ID ${id} not found`);
    }

    return bid;
  }

  async getAuctionBids(auctionId: string, query: BidQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [bids, total] = await Promise.all([
      this.prisma.bid.findMany({
        where: {
          auctionId,
          status: 'ACCEPTED',
        },
        skip,
        take: limit,
        orderBy: {
          amount: 'desc',
        },
      }),
      this.prisma.bid.count({
        where: {
          auctionId,
          status: 'ACCEPTED',
        },
      }),
    ]);

    return {
      data: bids,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserBids(bidderId: string, query: BidQueryDto) {
    const { page = 1, limit = 10, auctionId, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { bidderId };
    if (auctionId) where.auctionId = auctionId;
    if (status) where.status = status;

    const [bids, total] = await Promise.all([
      this.prisma.bid.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          placedAt: 'desc',
        },
      }),
      this.prisma.bid.count({ where }),
    ]);

    return {
      data: bids,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getHighestBid(auctionId: string) {
    const highestBid = await this.prisma.bid.findFirst({
      where: {
        auctionId,
        status: 'ACCEPTED',
      },
      orderBy: {
        amount: 'desc',
      },
    });

    return highestBid;
  }

  async cancelBid(bidId: string, bidderId: string) {
    const bid = await this.prisma.bid.findFirst({
      where: {
        id: bidId,
        bidderId,
        status: 'PENDING',
      },
    });

    if (!bid) {
      throw new NotFoundException('Bid not found or cannot be cancelled');
    }

    const updatedBid = await this.prisma.bid.update({
      where: { id: bidId },
      data: {
        status: 'CANCELLED',
      },
    });

    // Create bid history entry
    await this.prisma.bidHistory.create({
      data: {
        bidId: bid.id,
        auctionId: bid.auctionId,
        bidderId: bid.bidderId,
        amount: bid.amount,
        action: 'CANCELLED',
        timestamp: new Date(),
      },
    });

    return updatedBid;
  }

  async getBidStatistics(auctionId?: string) {
    const where = auctionId ? { auctionId } : {};

    const [totalBids, activeBids, pendingBids, averageBidAmount] = await Promise.all([
      this.prisma.bid.count({ where }),
      this.prisma.bid.count({ where: { ...where, status: 'ACCEPTED' } }),
      this.prisma.bid.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.bid.aggregate({
        where: { ...where, status: 'ACCEPTED' },
        _avg: { amount: true },
      }),
    ]);

    return {
      totalBids,
      activeBids,
      pendingBids,
      averageBidAmount: averageBidAmount._avg.amount || 0,
    };
  }
}