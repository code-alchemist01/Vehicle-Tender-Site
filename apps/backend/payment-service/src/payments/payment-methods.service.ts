import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { StripeService } from './stripe.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { PaymentMethodType } from '@prisma/client';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentMethodsService {
  private readonly logger = new Logger(PaymentMethodsService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  async createPaymentMethod(createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const { userId, type, stripeMethodId, isDefault = false, metadata } = createPaymentMethodDto;

    try {
      // If this is set as default, unset other default methods for this user
      if (isDefault) {
        await this.prisma.paymentMethod.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const paymentMethod = await this.prisma.paymentMethod.create({
        data: {
          userId,
          type: type as PaymentMethodType,
          stripeMethodId,
          isDefault,
          metadata,
        },
      });

      this.logger.log(`Payment method created: ${paymentMethod.id} for user ${userId}`);
      return paymentMethod;
    } catch (error) {
      this.logger.error(`Failed to create payment method: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create payment method');
    }
  }

  async findPaymentMethodById(id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    return paymentMethod;
  }

  async findPaymentMethodsByUser(userId: string): Promise<PaymentMethod[]> {
    return this.prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async getDefaultPaymentMethod(userId: string): Promise<PaymentMethod | null> {
    return this.prisma.paymentMethod.findFirst({
      where: { userId, isDefault: true },
    });
  }

  async setDefaultPaymentMethod(id: string, userId: string): Promise<PaymentMethod> {
    const paymentMethod = await this.findPaymentMethodById(id);

    if (paymentMethod.userId !== userId) {
      throw new BadRequestException('Payment method does not belong to user');
    }

    // Unset other default methods for this user
    await this.prisma.paymentMethod.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // Set this method as default
    const updatedPaymentMethod = await this.prisma.paymentMethod.update({
      where: { id },
      data: { isDefault: true },
    });

    this.logger.log(`Payment method ${id} set as default for user ${userId}`);
    return updatedPaymentMethod;
  }

  async deletePaymentMethod(id: string, userId: string): Promise<void> {
    const paymentMethod = await this.findPaymentMethodById(id);

    if (paymentMethod.userId !== userId) {
      throw new BadRequestException('Payment method does not belong to user');
    }

    try {
      // Detach from Stripe if needed
      if (paymentMethod.stripeMethodId) {
        await this.stripeService.detachPaymentMethod(paymentMethod.stripeMethodId);
      }

      await this.prisma.paymentMethod.delete({
        where: { id },
      });

      this.logger.log(`Payment method ${id} deleted for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete payment method ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to delete payment method');
    }
  }

  async getStripePaymentMethods(userId: string): Promise<any[]> {
    try {
      // Get user's Stripe customer ID (you might need to store this in user service)
      const stripeCustomerId = await this.getStripeCustomerId(userId);
      
      if (!stripeCustomerId) {
        return [];
      }

      return this.stripeService.listCustomerPaymentMethods(stripeCustomerId);
    } catch (error) {
      this.logger.error(`Failed to get Stripe payment methods for user ${userId}: ${error.message}`, error.stack);
      return [];
    }
  }

  private async getStripeCustomerId(userId: string): Promise<string | null> {
    // This is a placeholder - you would typically store the Stripe customer ID
    // in your user service or have a separate customer mapping table
    // For now, we'll return null and handle customer creation in the Stripe service
    return null;
  }
}