import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    
    if (!secretKey) {
      throw new Error('Stripe secret key is required');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: any,
  ): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
    });
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string,
  ): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    return this.stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
  }

  async createCustomer(
    email: string,
    name?: string,
    metadata?: any,
  ): Promise<Stripe.Customer> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    return this.stripe.customers.create({
      email,
      name,
      metadata,
    });
  }

  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string,
  ): Promise<Stripe.PaymentMethod> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    return this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
    metadata?: any,
  ): Promise<Stripe.Refund> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    const refundData: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
      metadata,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    return this.stripe.refunds.create(refundData);
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async listCustomerPaymentMethods(
    customerId: string,
    type: string = 'card',
  ): Promise<Stripe.PaymentMethod[]> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured');
    }

    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: type as Stripe.PaymentMethodListParams.Type,
    });

    return paymentMethods.data;
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<any> {
    try {
      return await this.stripe.paymentMethods.detach(paymentMethodId);
    } catch (error) {
      this.logger.error(`Failed to detach payment method: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to detach payment method');
    }
  }
}