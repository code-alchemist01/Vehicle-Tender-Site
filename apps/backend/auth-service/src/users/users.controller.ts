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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiResponseDto } from '../common/dto/response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Yeni kullanıcı oluştur' })
  @ApiResponse({ status: 201, description: 'Kullanıcı başarıyla oluşturuldu' })
  @ApiResponse({ status: 409, description: 'E-posta adresi zaten kullanılıyor' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return new ApiResponseDto(true, 'Kullanıcı başarıyla oluşturuldu', user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Tüm kullanıcıları listele' })
  @ApiResponse({ status: 200, description: 'Kullanıcılar başarıyla listelendi' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const result = await this.usersService.findAll(paginationDto);
    return new ApiResponseDto(true, 'Kullanıcılar başarıyla listelendi', result);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Mevcut kullanıcının profilini getir' })
  @ApiResponse({ status: 200, description: 'Profil başarıyla getirildi' })
  async getProfile(@CurrentUser() user: any) {
    const profile = await this.usersService.findOne(user.id);
    return new ApiResponseDto(true, 'Profil başarıyla getirildi', profile);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'ID ile kullanıcı getir' })
  @ApiResponse({ status: 200, description: 'Kullanıcı başarıyla getirildi' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return new ApiResponseDto(true, 'Kullanıcı başarıyla getirildi', user);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Mevcut kullanıcının profilini güncelle' })
  @ApiResponse({ status: 200, description: 'Profil başarıyla güncellendi' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.update(user.id, updateUserDto);
    return new ApiResponseDto(true, 'Profil başarıyla güncellendi', updatedUser);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Kullanıcıyı güncelle' })
  @ApiResponse({ status: 200, description: 'Kullanıcı başarıyla güncellendi' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    return new ApiResponseDto(true, 'Kullanıcı başarıyla güncellendi', user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Kullanıcıyı sil' })
  @ApiResponse({ status: 200, description: 'Kullanıcı başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  async remove(@Param('id') id: string) {
    const result = await this.usersService.remove(id);
    return new ApiResponseDto(true, result.message);
  }
}