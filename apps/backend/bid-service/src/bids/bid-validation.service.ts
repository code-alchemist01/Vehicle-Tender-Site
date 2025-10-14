import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../database/prisma.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BidValidationService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async validateBid(createBidDto: CreateBidDto): Promise<void> {
    const { auctionId, amount, bidderId } = createBidDto;

    // Get auction details from auction service
    const auction = await this.getAuctionDetails(auctionId);
    
    if (!auction) {
      throw new BadRequestException('Auction not found');
    }

    // Check if auction is active
    if (auction.status !== 'ACTIVE') {
      throw new BadRequestException('Auction is not active');
    }

    // Check if auction has ended
    const now = new Date();
    if (new Date(auction.endTime) <= now) {
      throw new BadRequestException('Auction has ended');
    }

    // Check if bidder is not the seller
    if (auction.sellerId === bidderId) {
      throw new BadRequestException('Seller cannot bid on their own auction');
    }

    // Check minimum bid amount
    const minBidAmount = auction.currentPrice + auction.minBidIncrement;
    if (amount < minBidAmount) {
      throw new BadRequestException(
        `Bid amount must be at least ${minBidAmount}`,
      );
    }

    // Check maximum bid amount
    const maxBidAmount = parseFloat(process.env.BID_MAX_AMOUNT) || 1000000;
    if (amount > maxBidAmount) {
      throw new BadRequestException(
        `Bid amount cannot exceed ${maxBidAmount}`,
      );
    }

    // Check if bidder has exceeded bid limit for this auction
    await this.checkBidLimit(auctionId, bidderId);

    // Check for suspicious bidding patterns
    await this.checkSuspiciousBidding(auctionId, bidderId, amount);
  }

  private async getAuctionDetails(auctionId: string): Promise<any> {
    try {
      const auctionServiceUrl = process.env.AUCTION_SERVICE_URL || 'http://localhost:4003';
      const response = await firstValueFrom(
        this.httpService.get(`${auctionServiceUrl}/auctions/${auctionId}`),
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching auction details:', error);
      return null;
    }
  }

  private async checkBidLimit(auctionId: string, bidderId: string): Promise<void> {
    const maxBidsPerAuction = parseInt(process.env.BID_MAX_BIDS_PER_AUCTION) || 50;
    
    const bidCount = await this.prisma.bid.count({
      where: {
        auctionId,
        bidderId,
        status: 'ACCEPTED',
      },
    });

    if (bidCount >= maxBidsPerAuction) {
      throw new BadRequestException(
        `Maximum ${maxBidsPerAuction} bids per auction exceeded`,
      );
    }
  }

  private async checkSuspiciousBidding(
    auctionId: string,
    bidderId: string,
    amount: number,
  ): Promise<void> {
    // Check for rapid consecutive bids
    const recentBids = await this.prisma.bid.findMany({
      where: {
        bidderId,
        placedAt: {
          gte: new Date(Date.now() - 60000), // Last minute
        },
      },
      orderBy: {
        placedAt: 'desc',
      },
      take: 5,
    });

    if (recentBids.length >= 3) {
      throw new BadRequestException('Too many bids in a short time period');
    }

    // Log validation for audit
    await this.prisma.bidValidation.create({
      data: {
        bidId: '', // This should be set after bid creation
        auctionId,
        bidderId,
        validations: {
          bidLimit: 'PASSED',
          suspiciousBidding: 'PASSED',
          amountValidation: 'PASSED',
        },
        isValid: true,
        errors: [],
      },
    });
  }
}