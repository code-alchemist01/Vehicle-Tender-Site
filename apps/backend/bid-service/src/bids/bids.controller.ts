import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BidsService } from './bids.service';
import { AutoBidService } from './auto-bid.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { CreateAutoBidDto } from './dto/create-auto-bid.dto';
import { BidQueryDto } from './dto/bid-query.dto';

@ApiTags('Bids')
@Controller('bids')
export class BidsController {
  constructor(
    private readonly bidsService: BidsService,
    private readonly autoBidService: AutoBidService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 bids per minute
  @ApiOperation({ summary: 'Place a new bid' })
  @ApiResponse({ status: 201, description: 'Bid placed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid bid data' })
  @ApiResponse({ status: 429, description: 'Too many bids' })
  async createBid(@Body() createBidDto: CreateBidDto) {
    console.log(`[BIDS-CONTROLLER] Received bid request:`, createBidDto);
    
    try {
      const result = await this.bidsService.createBid(createBidDto);
      console.log(`[BIDS-CONTROLLER] Bid created successfully:`, result.id);
      return result;
    } catch (error) {
      console.log(`[BIDS-CONTROLLER] Error creating bid:`, error.message);
      throw error;
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get bid statistics' })
  @ApiQuery({ name: 'auctionId', required: false, description: 'Filter by auction ID' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getBidStatistics(@Query('auctionId') auctionId?: string) {
    return this.bidsService.getBidStatistics(auctionId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bids with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Bids retrieved successfully' })
  async getBids(@Query() query: BidQueryDto) {
    return this.bidsService.getBids(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bid by ID' })
  @ApiResponse({ status: 200, description: 'Bid retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Bid not found' })
  async getBidById(@Param('id') id: string) {
    return this.bidsService.getBidById(id);
  }

  @Get('auction/:auctionId/highest')
  @ApiOperation({ summary: 'Get highest bid for an auction' })
  @ApiResponse({ status: 200, description: 'Highest bid retrieved successfully' })
  async getHighestBid(@Param('auctionId') auctionId: string) {
    return this.bidsService.getHighestBid(auctionId);
  }

  @Get('auction/:auctionId')
  @ApiOperation({ summary: 'Get bids for a specific auction' })
  @ApiResponse({ status: 200, description: 'Auction bids retrieved successfully' })
  async getAuctionBids(
    @Param('auctionId') auctionId: string,
    @Query() query: BidQueryDto,
  ) {
    return this.bidsService.getAuctionBids(auctionId, query);
  }

  @Get('user/:bidderId')
  @ApiOperation({ summary: 'Get bids for a specific user' })
  @ApiResponse({ status: 200, description: 'User bids retrieved successfully' })
  async getUserBids(
    @Param('bidderId') bidderId: string,
    @Query() query: BidQueryDto,
  ) {
    return this.bidsService.getUserBids(bidderId, query);
  }

  @Delete(':id/cancel/:bidderId')
  @ApiOperation({ summary: 'Cancel a pending bid' })
  @ApiResponse({ status: 200, description: 'Bid cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Bid not found or cannot be cancelled' })
  async cancelBid(
    @Param('id') bidId: string,
    @Param('bidderId') bidderId: string,
  ) {
    return this.bidsService.cancelBid(bidId, bidderId);
  }

  // Auto Bid Endpoints
  @Post('auto')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create auto bid' })
  @ApiResponse({ status: 201, description: 'Auto bid created successfully' })
  async createAutoBid(@Body() createAutoBidDto: CreateAutoBidDto) {
    return this.autoBidService.createAutoBid(createAutoBidDto);
  }

  @Get('auto/user/:bidderId')
  @ApiOperation({ summary: 'Get user auto bids' })
  @ApiResponse({ status: 200, description: 'Auto bids retrieved successfully' })
  async getUserAutoBids(@Param('bidderId') bidderId: string) {
    return this.autoBidService.getUserAutoBids(bidderId);
  }

  @Delete('auto/:autoBidId/user/:bidderId')
  @ApiOperation({ summary: 'Deactivate auto bid' })
  @ApiResponse({ status: 200, description: 'Auto bid deactivated successfully' })
  async deactivateAutoBid(
    @Param('autoBidId') autoBidId: string,
    @Param('bidderId') bidderId: string,
  ) {
    return this.autoBidService.deactivateAutoBid(autoBidId, bidderId);
  }
}