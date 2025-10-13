import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // CORS configuration
  app.enableCors({
    origin: configService.get('ALLOWED_ORIGINS')?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });
  
  // Global prefix
  app.setGlobalPrefix('api/v1');
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Vehicle Service API')
    .setDescription('Vehicle management service for vehicle auction platform')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = configService.get('PORT') || 3002;
  const host = configService.get('HOST') || 'localhost';
  
  await app.listen(port, host);
  
  console.log(`🚗 Vehicle Service is running on: http://${host}:${port}`);
  console.log(`📚 API Documentation: http://${host}:${port}/api/docs`);
}

bootstrap();