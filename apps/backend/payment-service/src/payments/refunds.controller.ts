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
import { RefundsService } from './refunds.service';
import { CreateRefundDto } from './dto/create-refund.dto';

@ApiTags('Refunds')
@Controller('refunds')
@UseGuards(ThrottlerGuard)
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new refund' })
  @ApiResponse({ status: 201, description: 'Refund created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiBearerAuth()
  async createRefund(@Body() createRefundDto: CreateRefundDto) {
    return this.refundsService.createRefund(createRefundDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get refund by ID' })
  @ApiResponse({ status: 200, description: 'Refund found' })
  @ApiResponse({ status: 404, description: 'Refund not found' })
  @ApiBearerAuth()
  async getRefund(@Param('id') id: string) {
    return this.refundsService.findRefundById(id);
  }

  @Get('payment/:paymentId')
  @ApiOperation({ summary: 'Get refunds by payment ID' })
  @ApiResponse({ status: 200, description: 'Refunds found' })
  @ApiBearerAuth()
  async getRefundsByPayment(@Param('paymentId') paymentId: string) {
    return this.refundsService.findRefundsByPayment(paymentId);
  }

  @Get('bidder/:bidderId')
  @ApiOperation({ summary: 'Get refunds by bidder ID' })
  @ApiResponse({ status: 200, description: 'Refunds found' })
  @ApiBearerAuth()
  async getRefundsByBidder(@Param('bidderId') bidderId: string) {
    return this.refundsService.findRefundsByBidder(bidderId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a refund' })
  @ApiResponse({ status: 200, description: 'Refund cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel refund' })
  @ApiResponse({ status: 404, description: 'Refund not found' })
  @ApiBearerAuth()
  async cancelRefund(@Param('id') id: string) {
    return this.refundsService.cancelRefund(id);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get refund statistics' })
  @ApiQuery({ name: 'bidderId', required: false, description: 'Filter by bidder ID' })
  @ApiQuery({ name: 'paymentId', required: false, description: 'Filter by payment ID' })
  @ApiResponse({ status: 200, description: 'Refund statistics' })
  @ApiBearerAuth()
  async getRefundStatistics(
    @Query('bidderId') bidderId?: string,
    @Query('paymentId') paymentId?: string,
  ) {
    return this.refundsService.getRefundStatistics(bidderId, paymentId);
  }
}