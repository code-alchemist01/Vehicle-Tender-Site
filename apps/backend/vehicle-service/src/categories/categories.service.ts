import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto, PaginationMetaDto, PaginatedResponseDto } from '@/common/dto/pagination.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Check if category with same name already exists
    const existingCategory = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<any>> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { vehicles: true },
          },
        },
      }),
      this.prisma.category.count(),
    ]);

    const meta = new PaginationMetaDto(page, limit, total);
    return new PaginatedResponseDto(categories, meta);
  }

  async findAllActive() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { vehicles: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { vehicles: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    // Check if category exists
    await this.findOne(id);

    // Check if name is being updated and if it conflicts
    if (updateCategoryDto.name) {
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          name: updateCategoryDto.name,
          NOT: { id },
        },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    // Check if category exists
    await this.findOne(id);

    // Check if category has vehicles
    const vehicleCount = await this.prisma.vehicle.count({
      where: { categoryId: id },
    });

    if (vehicleCount > 0) {
      throw new ConflictException('Cannot delete category that has vehicles');
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}