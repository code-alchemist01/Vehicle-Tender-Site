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

    console.log(`[BID-VALIDATION] Starting validation for bid:`, {
      auctionId,
      amount,
      bidderId
    });

    // Get auction details from auction service
    const auction = await this.getAuctionDetails(auctionId);
    
    console.log(`[BID-VALIDATION] Auction lookup result:`, auction ? 'Found' : 'Not found');
    
    if (!auction) {
      console.log(`[BID-VALIDATION] Throwing 'Auction not found' error for ID: ${auctionId}`);
      throw new BadRequestException('Auction not found');
    }

    console.log(`[BID-VALIDATION] Auction details:`, {
      id: auction.id,
      status: auction.status,
      endTime: auction.endTime,
      sellerId: auction.sellerId,
      currentPrice: auction.currentPrice
    });

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
      const fullUrl = `${auctionServiceUrl}/api/v1/auctions/${auctionId}`;
      
      console.log(`[BID-VALIDATION] Fetching auction details from: ${fullUrl}`);
      console.log(`[BID-VALIDATION] Environment AUCTION_SERVICE_URL: ${process.env.AUCTION_SERVICE_URL}`);
      
      const response = await firstValueFrom(
        this.httpService.get(fullUrl),
      );
      
      console.log(`[BID-VALIDATION] Successfully fetched auction details. Status: ${response.status}`);
      console.log(`[BID-VALIDATION] Auction data:`, JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error) {
      console.error(`[BID-VALIDATION] Error fetching auction details for ID ${auctionId}:`, error.message);
      console.error(`[BID-VALIDATION] Error details:`, {
        url: `${process.env.AUCTION_SERVICE_URL || 'http://localhost:4003'}/api/v1/auctions/${auctionId}`,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
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