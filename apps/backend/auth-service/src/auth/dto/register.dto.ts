import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Kullanıcının e-posta adresi',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  email: string;

  @ApiProperty({
    description: 'Kullanıcının adı',
    example: 'Ahmet',
  })
  @IsString({ message: 'Ad alanı metin olmalıdır' })
  firstName: string;

  @ApiProperty({
    description: 'Kullanıcının soyadı',
    example: 'Yılmaz',
  })
  @IsString({ message: 'Soyad alanı metin olmalıdır' })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Kullanıcının telefon numarası',
    example: '+905551234567',
  })
  @IsOptional()
  @IsString({ message: 'Telefon numarası metin olmalıdır' })
  phone?: string;

  @ApiProperty({
    description: 'Kullanıcının şifresi (minimum 6 karakter)',
    example: 'password123',
    minLength: 6,
  })
  @IsString({ message: 'Şifre alanı metin olmalıdır' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  password: string;
}