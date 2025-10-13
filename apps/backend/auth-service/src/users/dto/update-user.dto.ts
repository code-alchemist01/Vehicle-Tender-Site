import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'Kullanıcının aktif durumu',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Aktif durumu boolean olmalıdır' })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'E-posta doğrulama durumu',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'E-posta doğrulama durumu boolean olmalıdır' })
  isEmailVerified?: boolean;
}