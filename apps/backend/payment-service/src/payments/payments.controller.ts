import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(ThrottlerGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBearerAuth()
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createPayment(createPaymentDto);
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Process a payment' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiBearerAuth()
  async processPayment(
    @Param('id') id: string,
    @Body('stripePaymentMethodId') stripePaymentMethodId: string,
  ) {
    return this.paymentsService.processPayment(id, stripePaymentMethodId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment found' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiBearerAuth()
  async getPayment(@Param('id') id: string) {
    return this.paymentsService.findPaymentById(id);
  }

  @Get('auction/:auctionId')
  @ApiOperation({ summary: 'Get payments by auction ID' })
  @ApiResponse({ status: 200, description: 'Payments found' })
  @ApiBearerAuth()
  async getPaymentsByAuction(@Param('auctionId') auctionId: string) {
    return this.paymentsService.findPaymentsByAuction(auctionId);
  }

  @Get('bidder/:bidderId')
  @ApiOperation({ summary: 'Get payments by bidder ID' })
  @ApiResponse({ status: 200, description: 'Payments found' })
  @ApiBearerAuth()
  async getPaymentsByBidder(@Param('bidderId') bidderId: string) {
    return this.paymentsService.findPaymentsByBidder(bidderId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a payment' })
  @ApiResponse({ status: 200, description: 'Payment cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel payment' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiBearerAuth()
  async cancelPayment(@Param('id') id: string) {
    return this.paymentsService.cancelPayment(id);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get payment statistics' })
  @ApiQuery({ name: 'bidderId', required: false, description: 'Filter by bidder ID' })
  @ApiQuery({ name: 'auctionId', required: false, description: 'Filter by auction ID' })
  @ApiResponse({ status: 200, description: 'Payment statistics' })
  @ApiBearerAuth()
  async getPaymentStatistics(
    @Query('bidderId') bidderId?: string,
    @Query('auctionId') auctionId?: string,
  ) {
    return this.paymentsService.getPaymentStatistics(bidderId, auctionId);
  }
}