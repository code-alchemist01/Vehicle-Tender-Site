import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { BidsService } from './bids.service';
import { CreateAutoBidDto } from './dto/create-auto-bid.dto';

@Injectable()
export class AutoBidService {
  private readonly logger = new Logger(AutoBidService.name);

  constructor(
    private prisma: PrismaService,
    private bidsService: BidsService,
  ) {}

  async createAutoBid(createAutoBidDto: CreateAutoBidDto) {
    const { auctionId, bidderId, maxAmount, incrementAmount } = createAutoBidDto;

    // Check if auto bid already exists for this user and auction
    const existingAutoBid = await this.prisma.autoBid.findFirst({
      where: {
        auctionId,
        bidderId,
        isActive: true,
      },
    });

    if (existingAutoBid) {
      // Update existing auto bid
      return this.prisma.autoBid.update({
        where: { id: existingAutoBid.id },
        data: {
          maxAmount,
          increment: incrementAmount,
        },
      });
    }

    // Create new auto bid
    return this.prisma.autoBid.create({
      data: {
        auctionId,
        bidderId,
        maxAmount,
        increment: incrementAmount,
        isActive: true,
      },
    });
  }

  async deactivateAutoBid(autoBidId: string, bidderId: string) {
    return this.prisma.autoBid.updateMany({
      where: {
        id: autoBidId,
        bidderId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });
  }

  async getUserAutoBids(bidderId: string) {
    return this.prisma.autoBid.findMany({
      where: {
        bidderId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async processAutoBids() {
    this.logger.log('Processing auto bids...');

    try {
      // Get all active auto bids
      const autoBids = await this.prisma.autoBid.findMany({
        where: {
          isActive: true,
        },
      });

      for (const autoBid of autoBids) {
        await this.processAutoBid(autoBid);
      }

      this.logger.log(`Processed ${autoBids.length} auto bids`);
    } catch (error) {
      this.logger.error('Error processing auto bids:', error);
    }
  }

  private async processAutoBid(autoBid: any) {
    try {
      // Get current highest bid for the auction
      const currentHighestBid = await this.prisma.bid.findFirst({
        where: {
          auctionId: autoBid.auctionId,
          status: 'ACCEPTED',
        },
        orderBy: {
          amount: 'desc',
        },
      });

      // Skip if the auto bidder is already the highest bidder
      if (currentHighestBid?.bidderId === autoBid.bidderId) {
        return;
      }

      // Calculate next bid amount
      const currentAmount = currentHighestBid?.amount || 0;
      const nextBidAmount = Number(currentAmount) + Number(autoBid.increment);

      // Check if next bid amount exceeds max amount
      if (nextBidAmount > autoBid.maxAmount) {
        this.logger.log(
          `Auto bid ${autoBid.id} reached max amount ${autoBid.maxAmount}`,
        );
        
        // Deactivate auto bid
        await this.prisma.autoBid.update({
          where: { id: autoBid.id },
          data: { isActive: false },
        });
        return;
      }

      // Place auto bid
      await this.bidsService.createBid({
        auctionId: autoBid.auctionId,
        bidderId: autoBid.bidderId,
        amount: nextBidAmount,
        notes: 'Auto bid',
      });

      this.logger.log(
        `Auto bid placed: ${nextBidAmount} for auction ${autoBid.auctionId}`,
      );

    } catch (error) {
      this.logger.error(`Error processing auto bid ${autoBid.id}:`, error);
    }
  }
}