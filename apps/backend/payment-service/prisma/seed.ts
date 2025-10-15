import { PrismaClient, PaymentStatus, PaymentMethodType, PaymentAction, RefundStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding payment service database...');

  // Create sample payment methods
  const paymentMethods = await Promise.all([
    prisma.paymentMethod.upsert({
      where: { id: 'pm-1' },
      update: {},
      create: {
        id: 'pm-1',
        userId: 'user-1',
        type: PaymentMethodType.CREDIT_CARD,
        stripeMethodId: 'pm_1234567890abcdef',
        isDefault: true,
        metadata: {
          brand: 'visa',
          last4: '4242',
          expMonth: 12,
          expYear: 2025,
        },
      },
    }),
    prisma.paymentMethod.upsert({
      where: { id: 'pm-2' },
      update: {},
      create: {
        id: 'pm-2',
        userId: 'user-2',
        type: PaymentMethodType.CREDIT_CARD,
        stripeMethodId: 'pm_abcdef1234567890',
        isDefault: true,
        metadata: {
          brand: 'mastercard',
          last4: '5555',
          expMonth: 8,
          expYear: 2026,
        },
      },
    }),
    prisma.paymentMethod.upsert({
      where: { id: 'pm-3' },
      update: {},
      create: {
        id: 'pm-3',
        userId: 'user-3',
        type: PaymentMethodType.BANK_TRANSFER,
        isDefault: true,
        metadata: {
          bankName: 'Chase Bank',
          accountType: 'checking',
          routingNumber: '021000021',
        },
      },
    }),
  ]);

  console.log(`✅ Created ${paymentMethods.length} payment methods`);

  // Create sample payments
  const payments = await Promise.all([
    prisma.payment.upsert({
      where: { id: 'payment-1' },
      update: {},
      create: {
        id: 'payment-1',
        auctionId: 'auction-1',
        bidderId: 'user-3',
        amount: 7750000, // $77,500 in cents
        currency: 'USD',
        status: PaymentStatus.COMPLETED,
        paymentMethod: PaymentMethodType.CREDIT_CARD,
        stripePaymentId: 'pi_1234567890abcdef',
        stripeCustomerId: 'cus_abcdef1234567890',
        processedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        metadata: {
          auctionTitle: '2023 BMW M4 Competition',
          winningBid: true,
          paymentMethodId: 'pm-1',
        },
      },
    }),
    prisma.payment.upsert({
      where: { id: 'payment-2' },
      update: {},
      create: {
        id: 'payment-2',
        auctionId: 'auction-2',
        bidderId: 'user-5',
        amount: 5200000, // $52,000 in cents
        currency: 'USD',
        status: PaymentStatus.PROCESSING,
        paymentMethod: PaymentMethodType.CREDIT_CARD,
        stripePaymentId: 'pi_abcdef1234567890',
        stripeCustomerId: 'cus_1234567890abcdef',
        metadata: {
          auctionTitle: '1967 Ford Mustang Fastback',
          winningBid: true,
          paymentMethodId: 'pm-2',
        },
      },
    }),
    prisma.payment.upsert({
      where: { id: 'payment-3' },
      update: {},
      create: {
        id: 'payment-3',
        auctionId: 'auction-3',
        bidderId: 'user-2',
        amount: 500000, // $5,000 deposit in cents
        currency: 'USD',
        status: PaymentStatus.FAILED,
        paymentMethod: PaymentMethodType.CREDIT_CARD,
        stripePaymentId: 'pi_failed1234567890',
        stripeCustomerId: 'cus_failed1234567890',
        metadata: {
          auctionTitle: '2024 Porsche 911 Turbo S',
          depositPayment: true,
          failureReason: 'Insufficient funds',
        },
      },
    }),
    prisma.payment.upsert({
      where: { id: 'payment-4' },
      update: {},
      create: {
        id: 'payment-4',
        auctionId: 'auction-4',
        bidderId: 'user-1',
        amount: 1000000, // $10,000 deposit in cents
        currency: 'USD',
        status: PaymentStatus.COMPLETED,
        paymentMethod: PaymentMethodType.BANK_TRANSFER,
        processedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        metadata: {
          auctionTitle: '2022 Mercedes-AMG GT 63 S',
          depositPayment: true,
        },
      },
    }),
  ]);

  console.log(`✅ Created ${payments.length} payments`);

  // Create payment history entries
  const paymentHistories = await Promise.all([
    // Payment 1 history (completed)
    prisma.paymentHistory.create({
      data: {
        paymentId: 'payment-1',
        action: PaymentAction.CREATED,
        status: PaymentStatus.PENDING,
        amount: 7750000,
        metadata: { step: 'Payment initiated' },
      },
    }),
    prisma.paymentHistory.create({
      data: {
        paymentId: 'payment-1',
        action: PaymentAction.PROCESSING,
        status: PaymentStatus.PROCESSING,
        amount: 7750000,
        metadata: { step: 'Payment processing started' },
      },
    }),
    prisma.paymentHistory.create({
      data: {
        paymentId: 'payment-1',
        action: PaymentAction.COMPLETED,
        status: PaymentStatus.COMPLETED,
        amount: 7750000,
        metadata: { step: 'Payment completed successfully' },
      },
    }),
    // Payment 2 history (processing)
    prisma.paymentHistory.create({
      data: {
        paymentId: 'payment-2',
        action: PaymentAction.CREATED,
        status: PaymentStatus.PENDING,
        amount: 5200000,
        metadata: { step: 'Payment initiated' },
      },
    }),
    prisma.paymentHistory.create({
      data: {
        paymentId: 'payment-2',
        action: PaymentAction.PROCESSING,
        status: PaymentStatus.PROCESSING,
        amount: 5200000,
        metadata: { step: 'Payment processing in progress' },
      },
    }),
    // Payment 3 history (failed)
    prisma.paymentHistory.create({
      data: {
        paymentId: 'payment-3',
        action: PaymentAction.CREATED,
        status: PaymentStatus.PENDING,
        amount: 500000,
        metadata: { step: 'Payment initiated' },
      },
    }),
    prisma.paymentHistory.create({
      data: {
        paymentId: 'payment-3',
        action: PaymentAction.FAILED,
        status: PaymentStatus.FAILED,
        amount: 500000,
        metadata: { 
          step: 'Payment failed',
          error: 'Insufficient funds',
          stripeError: 'card_declined'
        },
      },
    }),
  ]);

  console.log(`✅ Created ${paymentHistories.length} payment history entries`);

  // Create sample refunds
  const refunds = await Promise.all([
    prisma.refund.upsert({
      where: { id: 'refund-1' },
      update: {},
      create: {
        id: 'refund-1',
        paymentId: 'payment-1',
        amount: 1000000, // $10,000 partial refund in cents
        reason: 'Vehicle condition dispute - partial refund agreed',
        status: RefundStatus.COMPLETED,
        stripeRefundId: 're_1234567890abcdef',
        processedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        metadata: {
          disputeId: 'dispute-001',
          agreementType: 'partial',
          refundPercentage: 12.9, // ~13% refund
        },
      },
    }),
    prisma.refund.upsert({
      where: { id: 'refund-2' },
      update: {},
      create: {
        id: 'refund-2',
        paymentId: 'payment-4',
        amount: 1000000, // Full deposit refund in cents
        reason: 'Auction cancelled by seller',
        status: RefundStatus.PROCESSING,
        stripeRefundId: 're_abcdef1234567890',
        metadata: {
          auctionCancelled: true,
          refundType: 'full_deposit',
        },
      },
    }),
  ]);

  console.log(`✅ Created ${refunds.length} refunds`);

  console.log('🎉 Payment service database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding payment service database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });