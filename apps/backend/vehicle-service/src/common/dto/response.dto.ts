import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;

  @ApiPropertyOptional()
  data?: T;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;

  constructor(message: string, data?: T) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'An error occurred' })
  message: string;

  @ApiPropertyOptional()
  error?: string;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp: string;

  constructor(message: string, statusCode: number, error?: string) {
    this.success = false;
    this.message = message;
    this.error = error;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}