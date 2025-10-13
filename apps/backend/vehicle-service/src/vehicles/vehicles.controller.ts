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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiResponseDto } from '@/common/dto/response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { VehicleStatus, FuelType, TransmissionType, VehicleCondition } from '@prisma/client';

@ApiTags('Vehicles')
@Controller('vehicles')
@UseGuards(ThrottlerGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new vehicle' })
  @ApiResponse({
    status: 201,
    description: 'Vehicle created successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async create(
    @Body() createVehicleDto: CreateVehicleDto,
    @CurrentUser() user: any,
  ) {
    const vehicle = await this.vehiclesService.create(createVehicleDto, user.id);
    return new ApiResponseDto('Vehicle created successfully', vehicle);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all vehicles with filters and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'make', required: false, type: String })
  @ApiQuery({ name: 'model', required: false, type: String })
  @ApiQuery({ name: 'yearFrom', required: false, type: Number })
  @ApiQuery({ name: 'yearTo', required: false, type: Number })
  @ApiQuery({ name: 'mileageFrom', required: false, type: Number })
  @ApiQuery({ name: 'mileageTo', required: false, type: Number })
  @ApiQuery({ name: 'priceFrom', required: false, type: Number })
  @ApiQuery({ name: 'priceTo', required: false, type: Number })
  @ApiQuery({ name: 'fuelType', required: false, enum: FuelType })
  @ApiQuery({ name: 'transmission', required: false, enum: TransmissionType })
  @ApiQuery({ name: 'condition', required: false, enum: VehicleCondition })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Vehicles retrieved successfully',
    type: ApiResponseDto,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('make') make?: string,
    @Query('model') model?: string,
    @Query('yearFrom') yearFrom?: number,
    @Query('yearTo') yearTo?: number,
    @Query('mileageFrom') mileageFrom?: number,
    @Query('mileageTo') mileageTo?: number,
    @Query('priceFrom') priceFrom?: number,
    @Query('priceTo') priceTo?: number,
    @Query('fuelType') fuelType?: FuelType,
    @Query('transmission') transmission?: TransmissionType,
    @Query('condition') condition?: VehicleCondition,
    @Query('categoryId') categoryId?: string,
    @Query('location') location?: string,
  ) {
    const filters = {
      make,
      model,
      yearFrom,
      yearTo,
      mileageFrom,
      mileageTo,
      priceFrom,
      priceTo,
      fuelType,
      transmission,
      condition,
      categoryId,
      location,
    };

    const result = await this.vehiclesService.findAll(paginationDto, filters);
    return new ApiResponseDto('Vehicles retrieved successfully', result);
  }

  @Get('my-vehicles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user vehicles' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'User vehicles retrieved successfully',
    type: ApiResponseDto,
  })
  async findMyVehicles(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.vehiclesService.findByUser(user.id, paginationDto);
    return new ApiResponseDto('User vehicles retrieved successfully', result);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async findOne(@Param('id') id: string) {
    const vehicle = await this.vehiclesService.findOne(id);
    return new ApiResponseDto('Vehicle retrieved successfully', vehicle);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update vehicle' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle updated successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not vehicle owner' })
  async update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @CurrentUser() user: any,
  ) {
    const vehicle = await this.vehiclesService.update(id, updateVehicleDto, user.id);
    return new ApiResponseDto('Vehicle updated successfully', vehicle);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update vehicle status' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle status updated successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not vehicle owner' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: VehicleStatus,
    @CurrentUser() user: any,
  ) {
    const vehicle = await this.vehiclesService.updateStatus(id, status, user.id);
    return new ApiResponseDto('Vehicle status updated successfully', vehicle);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete vehicle' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle deleted successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not vehicle owner or has active auctions' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.vehiclesService.remove(id, user.id);
    return new ApiResponseDto('Vehicle deleted successfully');
  }
}