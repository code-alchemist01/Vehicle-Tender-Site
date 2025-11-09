import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { SendEmailDto } from './dto/send-email.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Notification created successfully' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'read', required: false, description: 'Filter by read status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notifications retrieved successfully' })
  findAll(
    @Query('userId') userId?: string,
    @Query('read') read?: string,
  ) {
    const readBoolean = read === 'true' ? true : read === 'false' ? false : undefined;
    return this.notificationsService.findAll(userId, readBoolean);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Service is healthy' })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'notification-service',
    };
  }

  @Get('unread-count/:userId')
  @ApiOperation({ summary: 'Get unread notification count for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Unread count retrieved successfully' })
  getUnreadCount(@Param('userId') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification not found' })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification marked as read' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification not found' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('user/:userId/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'All notifications marked as read' })
  markAllAsRead(@Param('userId') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification not found' })
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Post('email/send')
  @ApiOperation({ summary: 'Send an email' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email sent successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid email data' })
  sendEmail(@Body() sendEmailDto: SendEmailDto) {
    return this.notificationsService.sendEmail(sendEmailDto);
  }

  @Post('bulk/auction-created')
  @ApiOperation({ summary: 'Notify users about a new auction' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Notifications sent successfully' })
  notifyAuctionCreated(
    @Body() data: { auctionId: string; vehicleTitle: string; startingPrice: number },
  ) {
    return this.notificationsService.notifyAuctionCreated(
      data.auctionId,
      data.vehicleTitle,
      data.startingPrice,
    );
  }

  @Post('bulk/bid-placed')
  @ApiOperation({ summary: 'Notify users about a new bid' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Notifications sent successfully' })
  notifyBidPlaced(
    @Body() data: {
      auctionId: string;
      vehicleTitle: string;
      bidAmount: number;
      bidderId: string;
    },
  ) {
    return this.notificationsService.notifyBidPlaced(
      data.auctionId,
      data.vehicleTitle,
      data.bidAmount,
      data.bidderId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification not found' })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}