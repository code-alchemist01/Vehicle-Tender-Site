import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { StripeService } from './stripe.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment, PaymentStatus, PaymentAction } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const {
      auctionId,
      bidderId,
      amount,
      currency = 'USD',
      paymentMethod,
      stripePaymentMethodId,
      metadata,
    } = createPaymentDto;

    try {
      // Create Stripe payment intent
      const paymentIntent = await this.stripeService.createPaymentIntent(
        amount,
        currency.toLowerCase(),
        {
          auctionId,
          bidderId,
          ...metadata,
        },
      );

      // Create payment record
      const payment = await this.prisma.payment.create({
        data: {
          auctionId,
          bidderId,
          amount,
          currency,
          status: PaymentStatus.PENDING,
          paymentMethod,
          stripePaymentId: paymentIntent.id,
          metadata,
        },
      });

      // Create payment history entry
      await this.createPaymentHistory(payment.id, PaymentAction.CREATED, PaymentStatus.PENDING);

      this.logger.log(`Payment created: ${payment.id} for auction ${auctionId}`);
      return payment;
    } catch (error) {
      this.logger.error(`Failed to create payment: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create payment');
    }
  }

  async processPayment(paymentId: string, stripePaymentMethodId: string): Promise<Payment> {
    const payment = await this.findPaymentById(paymentId);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not in pending status');
    }

    try {
      // Update payment status to processing
      await this.updatePaymentStatus(paymentId, PaymentStatus.PROCESSING);

      // Confirm payment with Stripe
      const confirmedPayment = await this.stripeService.confirmPaymentIntent(
        payment.stripePaymentId,
        stripePaymentMethodId,
      );

      let newStatus: PaymentStatus;
      if (confirmedPayment.status === 'succeeded') {
        newStatus = PaymentStatus.COMPLETED;
      } else if (confirmedPayment.status === 'requires_action') {
        newStatus = PaymentStatus.PROCESSING;
      } else {
        newStatus = PaymentStatus.FAILED;
      }

      // Update payment status
      const updatedPayment = await this.updatePaymentStatus(paymentId, newStatus);

      if (newStatus === PaymentStatus.COMPLETED) {
        await this.prisma.payment.update({
          where: { id: paymentId },
          data: { processedAt: new Date() },
        });
      }

      this.logger.log(`Payment processed: ${paymentId} with status ${newStatus}`);
      return updatedPayment;
    } catch (error) {
      this.logger.error(`Failed to process payment ${paymentId}: ${error.message}`, error.stack);
      await this.updatePaymentStatus(paymentId, PaymentStatus.FAILED);
      throw new BadRequestException('Failed to process payment');
    }
  }

  async findPaymentById(id: string): Promise<Payment> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        paymentHistory: {
          orderBy: { createdAt: 'desc' },
        },
        refunds: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findPaymentsByAuction(auctionId: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: { auctionId },
      include: {
        paymentHistory: {
          orderBy: { createdAt: 'desc' },
        },
        refunds: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPaymentsByBidder(bidderId: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: { bidderId },
      include: {
        paymentHistory: {
          orderBy: { createdAt: 'desc' },
        },
        refunds: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<Payment> {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status },
    });

    // Create payment history entry
    await this.createPaymentHistory(paymentId, this.getActionFromStatus(status), status);

    return payment;
  }

  async cancelPayment(paymentId: string): Promise<Payment> {
    const payment = await this.findPaymentById(paymentId);

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed payment');
    }

    return this.updatePaymentStatus(paymentId, PaymentStatus.CANCELLED);
  }

  async getPaymentStatistics(bidderId?: string, auctionId?: string) {
    const where: any = {};
    if (bidderId) where.bidderId = bidderId;
    if (auctionId) where.auctionId = auctionId;

    const [
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      totalAmount,
    ] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.count({ where: { ...where, status: PaymentStatus.COMPLETED } }),
      this.prisma.payment.count({ where: { ...where, status: PaymentStatus.PENDING } }),
      this.prisma.payment.count({ where: { ...where, status: PaymentStatus.FAILED } }),
      this.prisma.payment.aggregate({
        where: { ...where, status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      totalAmount: totalAmount._sum.amount || 0,
    };
  }

  private async createPaymentHistory(
    paymentId: string,
    action: PaymentAction,
    status: PaymentStatus,
    amount?: number,
    metadata?: any,
  ) {
    return this.prisma.paymentHistory.create({
      data: {
        paymentId,
        action,
        status,
        amount,
        metadata,
      },
    });
  }

  private getActionFromStatus(status: PaymentStatus): PaymentAction {
    switch (status) {
      case PaymentStatus.PENDING:
        return PaymentAction.CREATED;
      case PaymentStatus.PROCESSING:
        return PaymentAction.PROCESSING;
      case PaymentStatus.COMPLETED:
        return PaymentAction.COMPLETED;
      case PaymentStatus.FAILED:
        return PaymentAction.FAILED;
      case PaymentStatus.CANCELLED:
        return PaymentAction.CANCELLED;
      case PaymentStatus.REFUNDED:
        return PaymentAction.REFUNDED;
      case PaymentStatus.PARTIALLY_REFUNDED:
        return PaymentAction.PARTIALLY_REFUNDED;
      default:
        return PaymentAction.CREATED;
    }
  }
}