import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { StripeService } from './stripe.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import { Refund, RefundStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class RefundsService {
  private readonly logger = new Logger(RefundsService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  async createRefund(createRefundDto: CreateRefundDto): Promise<Refund> {
    const { paymentId, amount, reason, metadata } = createRefundDto;

    // Verify payment exists and is eligible for refund
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed payments');
    }

    // Calculate refund amount
    const refundAmount = amount || payment.amount;

    // Check if refund amount is valid
    const existingRefunds = await this.prisma.refund.findMany({
      where: { paymentId, status: RefundStatus.COMPLETED },
    });

    const totalRefunded = existingRefunds.reduce((sum, refund) => sum + refund.amount, 0);
    const remainingAmount = payment.amount - totalRefunded;

    if (refundAmount > remainingAmount) {
      throw new BadRequestException('Refund amount exceeds remaining refundable amount');
    }

    try {
      // Create refund in Stripe
      const stripeRefund = await this.stripeService.createRefund(
        payment.stripePaymentId,
        refundAmount,
        { reason, ...metadata },
      );

      // Create refund record
      const refund = await this.prisma.refund.create({
        data: {
          paymentId,
          amount: refundAmount,
          reason,
          status: RefundStatus.PENDING,
          stripeRefundId: stripeRefund.id,
          metadata,
        },
      });

      // Update refund status based on Stripe response
      let finalStatus: RefundStatus;
      if (stripeRefund.status === 'succeeded') {
        finalStatus = RefundStatus.COMPLETED;
      } else if (stripeRefund.status === 'failed') {
        finalStatus = RefundStatus.FAILED;
      } else {
        finalStatus = RefundStatus.PENDING;
      }

      const updatedRefund = await this.updateRefundStatus(refund.id, finalStatus);

      // Update payment status if fully refunded
      if (finalStatus === RefundStatus.COMPLETED) {
        const newTotalRefunded = totalRefunded + refundAmount;
        if (newTotalRefunded >= payment.amount) {
          await this.prisma.payment.update({
            where: { id: paymentId },
            data: { status: PaymentStatus.REFUNDED },
          });
        } else {
          await this.prisma.payment.update({
            where: { id: paymentId },
            data: { status: PaymentStatus.PARTIALLY_REFUNDED },
          });
        }
      }

      this.logger.log(`Refund created: ${refund.id} for payment ${paymentId}`);
      return updatedRefund;
    } catch (error) {
      this.logger.error(`Failed to create refund: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create refund');
    }
  }

  async findRefundById(id: string): Promise<Refund> {
    const refund = await this.prisma.refund.findUnique({
      where: { id },
      include: {
        payment: true,
      },
    });

    if (!refund) {
      throw new NotFoundException(`Refund with ID ${id} not found`);
    }

    return refund;
  }

  async findRefundsByPayment(paymentId: string): Promise<Refund[]> {
    return this.prisma.refund.findMany({
      where: { paymentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRefundsByBidder(bidderId: string): Promise<Refund[]> {
    return this.prisma.refund.findMany({
      where: {
        payment: {
          bidderId,
        },
      },
      include: {
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRefundStatus(refundId: string, status: RefundStatus): Promise<Refund> {
    const refund = await this.prisma.refund.update({
      where: { id: refundId },
      data: { 
        status,
        processedAt: status === RefundStatus.COMPLETED ? new Date() : undefined,
      },
    });

    this.logger.log(`Refund ${refundId} status updated to ${status}`);
    return refund;
  }

  async cancelRefund(refundId: string): Promise<Refund> {
    const refund = await this.findRefundById(refundId);

    if (refund.status !== RefundStatus.PENDING) {
      throw new BadRequestException('Can only cancel pending refunds');
    }

    try {
      // Cancel refund in Stripe if possible
      if (refund.stripeRefundId) {
        // Note: Stripe doesn't have a direct cancel refund API
        // This would depend on the specific Stripe implementation
      }

      return this.updateRefundStatus(refundId, RefundStatus.CANCELLED);
    } catch (error) {
      this.logger.error(`Failed to cancel refund ${refundId}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to cancel refund');
    }
  }

  async getRefundStatistics(bidderId?: string, paymentId?: string) {
    const where: any = {};
    if (bidderId) {
      where.payment = { bidderId };
    }
    if (paymentId) {
      where.paymentId = paymentId;
    }

    const [
      totalRefunds,
      completedRefunds,
      pendingRefunds,
      failedRefunds,
      totalAmount,
    ] = await Promise.all([
      this.prisma.refund.count({ where }),
      this.prisma.refund.count({ where: { ...where, status: RefundStatus.COMPLETED } }),
      this.prisma.refund.count({ where: { ...where, status: RefundStatus.PENDING } }),
      this.prisma.refund.count({ where: { ...where, status: RefundStatus.FAILED } }),
      this.prisma.refund.aggregate({
        where: { ...where, status: RefundStatus.COMPLETED },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalRefunds,
      completedRefunds,
      pendingRefunds,
      failedRefunds,
      totalAmount: totalAmount._sum.amount || 0,
    };
  }
}