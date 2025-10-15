import { IsString, IsArray, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({ description: 'Recipient email address(es)' })
  @IsArray()
  @IsString({ each: true })
  to: string[];

  @ApiProperty({ description: 'Email subject' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'HTML content', required: false })
  @IsOptional()
  @IsString()
  html?: string;

  @ApiProperty({ description: 'Text content', required: false })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({ description: 'Template name', required: false })
  @IsOptional()
  @IsString()
  template?: string;

  @ApiProperty({ description: 'Template variables', required: false })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;
}