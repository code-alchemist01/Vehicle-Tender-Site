import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Kullanıcının e-posta adresi',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  email: string;

  @ApiProperty({
    description: 'Kullanıcının şifresi',
    example: 'password123',
    minLength: 6,
  })
  @IsString({ message: 'Şifre alanı metin olmalıdır' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  password: string;
}