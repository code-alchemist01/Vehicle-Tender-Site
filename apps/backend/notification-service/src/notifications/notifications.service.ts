import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { EmailService } from '../common/email.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly emailService: EmailService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    try {
      const notification = await this.databaseService.notification.create({
        data: createNotificationDto,
      });

      this.logger.log(`Notification created for user ${createNotificationDto.userId}`);
      
      // Send email notification if applicable
      await this.sendEmailNotification(notification);
      
      return notification;
    } catch (error) {
      this.logger.error('Failed to create notification', error);
      throw error;
    }
  }

  async findAll(userId?: string, read?: boolean) {
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (read !== undefined) {
      where.read = read;
    }

    return this.databaseService.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const notification = await this.databaseService.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto) {
    await this.findOne(id); // Check if exists

    return this.databaseService.notification.update({
      where: { id },
      data: updateNotificationDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.databaseService.notification.delete({
      where: { id },
    });
  }

  async markAsRead(id: string) {
    return this.update(id, { read: true });
  }

  async markAllAsRead(userId: string) {
    return this.databaseService.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.databaseService.notification.count({
      where: { userId, read: false },
    });
  }

  async sendEmail(sendEmailDto: SendEmailDto) {
    try {
      if (sendEmailDto.template && sendEmailDto.variables) {
        return await this.emailService.sendTemplateEmail(
          sendEmailDto.to,
          sendEmailDto.template,
          sendEmailDto.variables,
        );
      } else {
        return await this.emailService.sendEmail({
          to: sendEmailDto.to,
          subject: sendEmailDto.subject,
          html: sendEmailDto.html,
          text: sendEmailDto.text,
        });
      }
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw error;
    }
  }

  private async sendEmailNotification(notification: any) {
    try {
      // Get user preferences (simplified - in real app, fetch from user service)
      const shouldSendEmail = await this.shouldSendEmailNotification(
        notification.userId,
        notification.type,
      );

      if (!shouldSendEmail) {
        return;
      }

      // Get user email (simplified - in real app, fetch from user service)
      const userEmail = await this.getUserEmail(notification.userId);
      if (!userEmail) {
        return;
      }

      const template = this.getEmailTemplate(notification.type);
      if (template) {
        await this.emailService.sendTemplateEmail(
          userEmail,
          template,
          {
            title: notification.title,
            message: notification.message,
            ...notification.data,
          },
        );
      }
    } catch (error) {
      this.logger.error('Failed to send email notification', error);
    }
  }

  private async shouldSendEmailNotification(userId: string, type: NotificationType): Promise<boolean> {
    try {
      const preferences = await this.databaseService.notificationPreference.findUnique({
        where: { userId },
      });

      if (!preferences || !preferences.emailEnabled) {
        return false;
      }

      // Check specific notification type preferences
      switch (type) {
        case NotificationType.AUCTION_CREATED:
        case NotificationType.AUCTION_STARTED:
        case NotificationType.AUCTION_ENDING_SOON:
        case NotificationType.AUCTION_ENDED:
          return preferences.auctionUpdates;
        case NotificationType.BID_PLACED:
        case NotificationType.BID_OUTBID:
        case NotificationType.BID_WON:
          return preferences.bidUpdates;
        case NotificationType.PAYMENT_REQUIRED:
        case NotificationType.PAYMENT_RECEIVED:
        case NotificationType.PAYMENT_FAILED:
          return preferences.paymentUpdates;
        case NotificationType.MARKETING:
          return preferences.marketingEmails;
        default:
          return true;
      }
    } catch (error) {
      this.logger.error('Failed to check notification preferences', error);
      return false;
    }
  }

  private async getUserEmail(userId: string): Promise<string | null> {
    // In a real application, this would call the user service
    // For now, return a placeholder
    return `user${userId}@example.com`;
  }

  private getEmailTemplate(type: NotificationType): string | null {
    const templateMap: Record<NotificationType, string> = {
      [NotificationType.AUCTION_CREATED]: 'auction_created',
      [NotificationType.BID_PLACED]: 'bid_placed',
      [NotificationType.BID_WON]: 'auction_won',
      [NotificationType.AUCTION_STARTED]: 'auction_started',
      [NotificationType.AUCTION_ENDING_SOON]: 'auction_ending_soon',
      [NotificationType.AUCTION_ENDED]: 'auction_ended',
      [NotificationType.BID_OUTBID]: 'bid_outbid',
      [NotificationType.PAYMENT_REQUIRED]: 'payment_required',
      [NotificationType.PAYMENT_RECEIVED]: 'payment_received',
      [NotificationType.PAYMENT_FAILED]: 'payment_failed',
      [NotificationType.VEHICLE_APPROVED]: 'vehicle_approved',
      [NotificationType.VEHICLE_REJECTED]: 'vehicle_rejected',
      [NotificationType.ACCOUNT_VERIFIED]: 'account_verified',
      [NotificationType.PASSWORD_RESET]: 'password_reset',
      [NotificationType.SYSTEM_MAINTENANCE]: 'system_maintenance',
      [NotificationType.MARKETING]: 'marketing',
    };

    return templateMap[type] || null;
  }

  // Bulk notification methods
  async createBulkNotifications(notifications: CreateNotificationDto[]) {
    try {
      const result = await this.databaseService.notification.createMany({
        data: notifications,
      });

      this.logger.log(`Created ${result.count} bulk notifications`);
      return result;
    } catch (error) {
      this.logger.error('Failed to create bulk notifications', error);
      throw error;
    }
  }

  async notifyAuctionCreated(auctionId: string, vehicleTitle: string, startingPrice: number) {
    // This would typically get interested users from the database
    const interestedUsers = await this.getInterestedUsers();
    
    const notifications = interestedUsers.map(userId => ({
      userId,
      type: NotificationType.AUCTION_CREATED,
      title: 'New Auction Available',
      message: `A new auction for ${vehicleTitle} has been created with starting price $${startingPrice}`,
      data: {
        auctionId,
        vehicleTitle,
        startingPrice,
        auctionUrl: `${process.env.FRONTEND_URL}/auctions/${auctionId}`,
      },
    }));

    return this.createBulkNotifications(notifications);
  }

  async notifyBidPlaced(auctionId: string, vehicleTitle: string, bidAmount: number, bidderId: string) {
    // Notify auction owner and previous bidders
    const usersToNotify = await this.getAuctionParticipants(auctionId, bidderId);
    
    const notifications = usersToNotify.map(userId => ({
      userId,
      type: NotificationType.BID_PLACED,
      title: 'New Bid Placed',
      message: `A new bid of $${bidAmount} has been placed on ${vehicleTitle}`,
      data: {
        auctionId,
        vehicleTitle,
        bidAmount,
        auctionUrl: `${process.env.FRONTEND_URL}/auctions/${auctionId}`,
      },
    }));

    return this.createBulkNotifications(notifications);
  }

  private async getInterestedUsers(): Promise<string[]> {
    // Placeholder - in real app, get users who opted in for auction notifications
    return ['user1', 'user2', 'user3'];
  }

  private async getAuctionParticipants(auctionId: string, excludeUserId: string): Promise<string[]> {
    // Placeholder - in real app, get auction owner and previous bidders
    return ['owner1', 'bidder1', 'bidder2'].filter(id => id !== excludeUserId);
  }
}