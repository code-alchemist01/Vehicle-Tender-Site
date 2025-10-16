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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuctionsService } from './auctions.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { PlaceBidDto } from './dto/place-bid.dto';
import { AuctionQueryDto } from './dto/auction-query.dto';

@ApiTags('Auctions')
@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new auction' })
  @ApiResponse({ status: 201, description: 'Auction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Vehicle already in auction' })
  @ApiBearerAuth()
  create(@Body() createAuctionDto: CreateAuctionDto) {
    return this.auctionsService.create(createAuctionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all auctions with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Auctions retrieved successfully' })
  findAll(@Query() query: AuctionQueryDto) {
    return this.auctionsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get auction statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats() {
    return this.auctionsService.getAuctionStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get auction by ID' })
  @ApiResponse({ status: 200, description: 'Auction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Auction not found' })
  findOne(@Param('id') id: string) {
    return this.auctionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update auction' })
  @ApiResponse({ status: 200, description: 'Auction updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update auction with bids' })
  @ApiResponse({ status: 404, description: 'Auction not found' })
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateAuctionDto: UpdateAuctionDto) {
    return this.auctionsService.update(id, updateAuctionDto);
  }

  @Post('update-statuses')
  @ApiOperation({ summary: 'Manually update auction statuses' })
  @ApiResponse({ status: 200, description: 'Auction statuses updated successfully' })
  manualUpdateStatuses() {
    return this.auctionsService.manualUpdateAuctionStatuses();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete auction' })
  @ApiResponse({ status: 204, description: 'Auction deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete auction with bids' })
  @ApiResponse({ status: 404, description: 'Auction not found' })
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.auctionsService.remove(id);
  }

  @Post(':id/bids')
  @ApiOperation({ summary: 'Place a bid on auction' })
  @ApiResponse({ status: 201, description: 'Bid placed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid bid amount or auction not active' })
  @ApiResponse({ status: 404, description: 'Auction not found' })
  @ApiBearerAuth()
  placeBid(@Param('id') id: string, @Body() placeBidDto: PlaceBidDto) {
    return this.auctionsService.placeBid({ ...placeBidDto, auctionId: id });
  }

  @Get(':id/bids')
  @ApiOperation({ summary: 'Get auction bids' })
  @ApiResponse({ status: 200, description: 'Bids retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Auction not found' })
  async getBids(@Param('id') id: string) {
    const auction = await this.auctionsService.findOne(id);
    return auction.bids;
  }

  @Post(':id/watchlist')
  @ApiOperation({ summary: 'Add auction to watchlist' })
  @ApiResponse({ status: 201, description: 'Added to watchlist successfully' })
  @ApiResponse({ status: 409, description: 'Already in watchlist' })
  @ApiResponse({ status: 404, description: 'Auction not found' })
  @ApiBearerAuth()
  addToWatchlist(
    @Param('id') auctionId: string,
    @Body('userId') userId: string,
  ) {
    return this.auctionsService.addToWatchlist(auctionId, userId);
  }

  @Delete(':id/watchlist/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove auction from watchlist' })
  @ApiResponse({ status: 204, description: 'Removed from watchlist successfully' })
  @ApiResponse({ status: 404, description: 'Auction not found in watchlist' })
  @ApiBearerAuth()
  removeFromWatchlist(
    @Param('id') auctionId: string,
    @Param('userId') userId: string,
  ) {
    return this.auctionsService.removeFromWatchlist(auctionId, userId);
  }
}