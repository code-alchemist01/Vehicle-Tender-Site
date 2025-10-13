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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiResponseDto } from '@/common/dto/response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(ThrottlerGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Category already exists' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);
    return new ApiResponseDto('Category created successfully', category);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all categories with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: ApiResponseDto,
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    const result = await this.categoriesService.findAll(paginationDto);
    return new ApiResponseDto('Categories retrieved successfully', result);
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Get all active categories' })
  @ApiResponse({
    status: 200,
    description: 'Active categories retrieved successfully',
    type: ApiResponseDto,
  })
  async findAllActive() {
    const categories = await this.categoriesService.findAllActive();
    return new ApiResponseDto('Active categories retrieved successfully', categories);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(id);
    return new ApiResponseDto('Category retrieved successfully', category);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Category name already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    return new ApiResponseDto('Category updated successfully', category);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Category has vehicles' })
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
    return new ApiResponseDto('Category deleted successfully');
  }
}