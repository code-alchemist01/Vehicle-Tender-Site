import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator';
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
    description: 'Kullanıcının şifresi (minimum 8 karakter, en az 1 büyük harf, 1 küçük harf ve 1 rakam)',
    example: 'Password123',
    minLength: 8,
  })
  @IsString({ message: 'Şifre alanı metin olmalıdır' })
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
    message: 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir',
  })
  password: string;
}