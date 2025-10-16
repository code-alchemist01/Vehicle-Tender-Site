import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Mevcut şifre',
    example: 'OldPassword123!',
  })
  @IsString({ message: 'Mevcut şifre alanı metin olmalıdır' })
  @MinLength(6, { message: 'Mevcut şifre en az 6 karakter olmalıdır' })
  currentPassword: string;

  @ApiProperty({
    description: 'Yeni şifre (minimum 8 karakter, en az 1 büyük harf, 1 küçük harf ve 1 rakam)',
    example: 'NewPassword123!',
    minLength: 8,
  })
  @IsString({ message: 'Yeni şifre alanı metin olmalıdır' })
  @MinLength(8, { message: 'Yeni şifre en az 8 karakter olmalıdır' })
  newPassword: string;
}