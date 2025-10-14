import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../database/prisma.service';
import { firstValueFrom } from 'rxjs';

@Processor('bid-processing')
export class BidProcessor {
  private readonly logger = new Logger(BidProcessor.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  @Process('process-bid')
  async processBid(job: Job) {
    const { bidId } = job.data;
    this.logger.log(`Processing bid: ${bidId}`);

    try {
      const bid = await this.prisma.bid.findUnique({
        where: { id: bidId },
      });

      if (!bid) {
        throw new Error(`Bid ${bidId} not found`);
      }

      // Update auction current price
      await this.updateAuctionPrice(bid.auctionId, Number(bid.amount));

      // Send notification
      await this.sendBidNotification(bid);

      // Update bid status to processed
      await this.prisma.bid.update({
        where: { id: bidId },
        data: { 
          status: 'ACCEPTED',
          processedAt: new Date(),
        },
      });

      // Create bid history entry
      await this.prisma.bidHistory.create({
        data: {
          bidId: bid.id,
          auctionId: bid.auctionId,
          bidderId: bid.bidderId,
          amount: bid.amount,
          action: 'PLACED',
          timestamp: new Date(),
        },
      });

      this.logger.log(`Bid ${bidId} processed successfully`);
    } catch (error) {
      this.logger.error(`Error processing bid ${bidId}:`, error);
      
      // Update bid status to failed
      await this.prisma.bid.update({
        where: { id: bidId },
        data: { 
          status: 'REJECTED',
          processedAt: new Date(),
        },
      });

      throw error;
    }
  }

  private async updateAuctionPrice(auctionId: string, amount: number) {
    try {
      const auctionServiceUrl = process.env.AUCTION_SERVICE_URL || 'http://localhost:4003';
      await firstValueFrom(
        this.httpService.patch(`${auctionServiceUrl}/auctions/${auctionId}/price`, {
          currentPrice: amount,
        }),
      );
    } catch (error) {
      this.logger.error('Error updating auction price:', error);
    }
  }

  private async sendBidNotification(bid: any) {
    try {
      const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4005';
      await firstValueFrom(
        this.httpService.post(`${notificationServiceUrl}/notifications`, {
          type: 'BID_PLACED',
          recipientId: bid.bidderId,
          data: {
            auctionId: bid.auctionId,
            bidAmount: bid.amount,
            bidId: bid.id,
          },
        }),
      );
    } catch (error) {
      this.logger.error('Error sending bid notification:', error);
    }
  }
}