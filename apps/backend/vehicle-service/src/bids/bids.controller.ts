import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('bids')
@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place a new bid' })
  @ApiResponse({ status: 201, description: 'Bid placed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Auction not found' })
  create(@Body() createBidDto: CreateBidDto, @Request() req) {
    return this.bidsService.create(createBidDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bids with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Bids retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'auctionId', required: false, type: String, description: 'Filter by auction ID' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user ID' })
  @ApiQuery({ name: 'amountFrom', required: false, type: Number, description: 'Minimum bid amount' })
  @ApiQuery({ name: 'amountTo', required: false, type: Number, description: 'Maximum bid amount' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('auctionId') auctionId?: string,
    @Query('userId') userId?: string,
    @Query('amountFrom') amountFrom?: number,
    @Query('amountTo') amountTo?: number,
  ) {
    const paginationDto = { page: page || 1, limit: limit || 10 };
    const filters = {
      auctionId,
      userId,
      amountFrom,
      amountTo,
    };

    return this.bidsService.findAll(paginationDto, filters);
  }

  @Get('my-bids')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user bids' })
  @ApiResponse({ status: 200, description: 'User bids retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  findByUser(@Query() paginationDto: PaginationDto, @Request() req) {
    return this.bidsService.findByUser(req.user.id, paginationDto);
  }

  @Get('my-winning-bids')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user winning bids' })
  @ApiResponse({ status: 200, description: 'User winning bids retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  getWinningBids(@Query() paginationDto: PaginationDto, @Request() req) {
    return this.bidsService.getWinningBids(req.user.id, paginationDto);
  }

  @Get('auction/:auctionId')
  @ApiOperation({ summary: 'Get bids for a specific auction' })
  @ApiResponse({ status: 200, description: 'Auction bids retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Auction not found' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  findByAuction(
    @Param('auctionId', ParseUUIDPipe) auctionId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.bidsService.findByAuction(auctionId, paginationDto);
  }

  @Get('auction/:auctionId/history')
  @ApiOperation({ summary: 'Get bid history for a specific auction' })
  @ApiResponse({ status: 200, description: 'Auction bid history retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Auction not found' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  getBidHistory(
    @Param('auctionId', ParseUUIDPipe) auctionId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.bidsService.getBidHistory(auctionId, paginationDto);
  }

  @Get('auction/:auctionId/highest')
  @ApiOperation({ summary: 'Get highest bid for a specific auction' })
  @ApiResponse({ status: 200, description: 'Highest bid retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Auction not found or no bids' })
  getHighestBidForAuction(@Param('auctionId', ParseUUIDPipe) auctionId: string) {
    return this.bidsService.getHighestBidForAuction(auctionId);
  }

  @Get('auction/:auctionId/my-bids')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user bids for a specific auction' })
  @ApiResponse({ status: 200, description: 'User auction bids retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Auction not found' })
  getUserBidsForAuction(
    @Param('auctionId', ParseUUIDPipe) auctionId: string,
    @Request() req,
  ) {
    return this.bidsService.getUserBidsForAuction(auctionId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bid by ID' })
  @ApiResponse({ status: 200, description: 'Bid retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Bid not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bidsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update bid (comment only)' })
  @ApiResponse({ status: 200, description: 'Bid updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Bid not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBidDto: UpdateBidDto,
    @Request() req,
  ) {
    return this.bidsService.update(id, updateBidDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete bid (only for draft auctions)' })
  @ApiResponse({ status: 200, description: 'Bid deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Bid not found' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.bidsService.remove(id, req.user.id);
  }
}