import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';

@ApiTags('Payment Methods')
@Controller('payment-methods')
@UseGuards(ThrottlerGuard)
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment method' })
  @ApiResponse({ status: 201, description: 'Payment method created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBearerAuth()
  async createPaymentMethod(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    return this.paymentMethodsService.createPaymentMethod(createPaymentMethodDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment method by ID' })
  @ApiResponse({ status: 200, description: 'Payment method found' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiBearerAuth()
  async getPaymentMethod(@Param('id') id: string) {
    return this.paymentMethodsService.findPaymentMethodById(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get payment methods by user ID' })
  @ApiResponse({ status: 200, description: 'Payment methods found' })
  @ApiBearerAuth()
  async getPaymentMethodsByUser(@Param('userId') userId: string) {
    return this.paymentMethodsService.findPaymentMethodsByUser(userId);
  }

  @Get('user/:userId/default')
  @ApiOperation({ summary: 'Get default payment method for user' })
  @ApiResponse({ status: 200, description: 'Default payment method found' })
  @ApiResponse({ status: 404, description: 'No default payment method found' })
  @ApiBearerAuth()
  async getDefaultPaymentMethod(@Param('userId') userId: string) {
    return this.paymentMethodsService.getDefaultPaymentMethod(userId);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Set payment method as default' })
  @ApiResponse({ status: 200, description: 'Payment method set as default' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiBearerAuth()
  async setDefaultPaymentMethod(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.paymentMethodsService.setDefaultPaymentMethod(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payment method' })
  @ApiResponse({ status: 200, description: 'Payment method deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiBearerAuth()
  async deletePaymentMethod(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    await this.paymentMethodsService.deletePaymentMethod(id, userId);
    return { message: 'Payment method deleted successfully' };
  }

  @Get('user/:userId/stripe')
  @ApiOperation({ summary: 'Get Stripe payment methods for user' })
  @ApiResponse({ status: 200, description: 'Stripe payment methods found' })
  @ApiBearerAuth()
  async getStripePaymentMethods(@Param('userId') userId: string) {
    return this.paymentMethodsService.getStripePaymentMethods(userId);
  }
}