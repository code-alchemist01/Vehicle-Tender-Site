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
  ParseEnumPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuctionsService } from './auctions.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuctionStatus } from '@prisma/client';

@ApiTags('auctions')
@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new auction' })
  @ApiResponse({ status: 201, description: 'Auction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  create(@Body() createAuctionDto: CreateAuctionDto, @Request() req) {
    return this.auctionsService.create(createAuctionDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all auctions with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Auctions retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, enum: AuctionStatus, description: 'Filter by auction status' })
  @ApiQuery({ name: 'vehicleId', required: false, type: String, description: 'Filter by vehicle ID' })
  @ApiQuery({ name: 'startPriceFrom', required: false, type: Number, description: 'Minimum starting price' })
  @ApiQuery({ name: 'startPriceTo', required: false, type: Number, description: 'Maximum starting price' })
  @ApiQuery({ name: 'currentPriceFrom', required: false, type: Number, description: 'Minimum current price' })
  @ApiQuery({ name: 'currentPriceTo', required: false, type: Number, description: 'Maximum current price' })
  @ApiQuery({ name: 'startTimeFrom', required: false, type: Date, description: 'Filter auctions starting from this date' })
  @ApiQuery({ name: 'startTimeTo', required: false, type: Date, description: 'Filter auctions starting before this date' })
  @ApiQuery({ name: 'endTimeFrom', required: false, type: Date, description: 'Filter auctions ending from this date' })
  @ApiQuery({ name: 'endTimeTo', required: false, type: Date, description: 'Filter auctions ending before this date' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: AuctionStatus,
    @Query('vehicleId') vehicleId?: string,
    @Query('startPriceFrom') startPriceFrom?: number,
    @Query('startPriceTo') startPriceTo?: number,
    @Query('currentPriceFrom') currentPriceFrom?: number,
    @Query('currentPriceTo') currentPriceTo?: number,
    @Query('startTimeFrom') startTimeFrom?: string,
    @Query('startTimeTo') startTimeTo?: string,
    @Query('endTimeFrom') endTimeFrom?: string,
    @Query('endTimeTo') endTimeTo?: string,
  ) {
    const paginationDto = { page: page || 1, limit: limit || 10 };
    const filters = {
      status,
      vehicleId,
      startPriceFrom,
      startPriceTo,
      currentPriceFrom,
      currentPriceTo,
      startTimeFrom,
      startTimeTo,
      endTimeFrom,
      endTimeTo,
    };

    return this.auctionsService.findAll(paginationDto, filters);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active auctions' })
  @ApiResponse({ status: 200, description: 'Active auctions retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  getActiveAuctions(@Query() paginationDto: PaginationDto) {
    return this.auctionsService.getActiveAuctions(paginationDto);
  }

  @Get('ending-soon')
  @ApiOperation({ summary: 'Get auctions ending soon' })
  @ApiResponse({ status: 200, description: 'Ending soon auctions retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'hours', required: false, type: Number, description: 'Hours until end (default: 24)' })
  getEndingSoon(
    @Query() paginationDto: PaginationDto,
    @Query('hours', new ParseIntPipe({ optional: true })) hours?: number,
  ) {
    return this.auctionsService.getEndingSoon(hours, paginationDto);
  }

  @Get('my-auctions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user auctions' })
  @ApiResponse({ status: 200, description: 'User auctions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  findByUser(@Query() paginationDto: PaginationDto, @Request() req) {
    return this.auctionsService.findByUser(req.user.id, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get auction by ID' })
  @ApiResponse({ status: 200, description: 'Auction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Auction not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.auctionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update auction' })
  @ApiResponse({ status: 200, description: 'Auction updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Auction not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAuctionDto: UpdateAuctionDto,
    @Request() req,
  ) {
    return this.auctionsService.update(id, updateAuctionDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete auction' })
  @ApiResponse({ status: 200, description: 'Auction deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Auction not found' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.auctionsService.remove(id, req.user.id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update auction status' })
  @ApiResponse({ status: 200, description: 'Auction status updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Auction not found' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status', new ParseEnumPipe(AuctionStatus)) status: AuctionStatus,
    @Request() req,
  ) {
    return this.auctionsService.updateStatus(id, status, req.user.id);
  }
}