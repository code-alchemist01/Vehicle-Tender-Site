import { PrismaClient, BidStatus, BidAction } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding bid service database...');

  // Create sample bids
  const bids = await Promise.all([
    prisma.bid.upsert({
      where: { id: 'bid-1' },
      update: {},
      create: {
        id: 'bid-1',
        auctionId: 'auction-1',
        bidderId: 'user-2',
        amount: 76000,
        isAutomatic: false,
        status: BidStatus.ACCEPTED,
        placedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        processedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5000), // 5 seconds after placed
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    }),
    prisma.bid.upsert({
      where: { id: 'bid-2' },
      update: {},
      create: {
        id: 'bid-2',
        auctionId: 'auction-1',
        bidderId: 'user-3',
        amount: 77500,
        isAutomatic: false,
        status: BidStatus.ACCEPTED,
        placedAt: new Date(Date.now() - 90 * 60 * 1000), // 90 minutes ago
        processedAt: new Date(Date.now() - 90 * 60 * 1000 + 3000), // 3 seconds after placed
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    }),
    prisma.bid.upsert({
      where: { id: 'bid-3' },
      update: {},
      create: {
        id: 'bid-3',
        auctionId: 'auction-2',
        bidderId: 'user-4',
        amount: 46000,
        isAutomatic: false,
        status: BidStatus.OUTBID,
        placedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        processedAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 2000),
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      },
    }),
    prisma.bid.upsert({
      where: { id: 'bid-4' },
      update: {},
      create: {
        id: 'bid-4',
        auctionId: 'auction-2',
        bidderId: 'user-5',
        amount: 52000,
        isAutomatic: true,
        maxAmount: 55000,
        status: BidStatus.ACCEPTED,
        placedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        processedAt: new Date(Date.now() - 30 * 60 * 1000 + 1500),
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      },
    }),
    prisma.bid.upsert({
      where: { id: 'bid-5' },
      update: {},
      create: {
        id: 'bid-5',
        auctionId: 'auction-3',
        bidderId: 'user-2',
        amount: 152000,
        isAutomatic: false,
        status: BidStatus.REJECTED,
        placedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        processedAt: new Date(Date.now() - 15 * 60 * 1000 + 8000),
        failureReason: 'Insufficient funds verification',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    }),
  ]);

  console.log(`✅ Created ${bids.length} bids`);

  // Create bid history entries
  const bidHistories = await Promise.all([
    prisma.bidHistory.create({
      data: {
        bidId: 'bid-1',
        auctionId: 'auction-1',
        bidderId: 'user-2',
        amount: 76000,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        action: BidAction.PLACED,
      },
    }),
    prisma.bidHistory.create({
      data: {
        bidId: 'bid-1',
        auctionId: 'auction-1',
        bidderId: 'user-2',
        amount: 76000,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5000),
        action: BidAction.ACCEPTED,
      },
    }),
    prisma.bidHistory.create({
      data: {
        bidId: 'bid-2',
        auctionId: 'auction-1',
        bidderId: 'user-3',
        amount: 77500,
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
        action: BidAction.PLACED,
      },
    }),
    prisma.bidHistory.create({
      data: {
        bidId: 'bid-1',
        auctionId: 'auction-1',
        bidderId: 'user-2',
        amount: 76000,
        timestamp: new Date(Date.now() - 90 * 60 * 1000 + 3000),
        action: BidAction.OUTBID,
      },
    }),
    prisma.bidHistory.create({
      data: {
        bidId: 'bid-2',
        auctionId: 'auction-1',
        bidderId: 'user-3',
        amount: 77500,
        timestamp: new Date(Date.now() - 90 * 60 * 1000 + 3000),
        action: BidAction.ACCEPTED,
      },
    }),
  ]);

  console.log(`✅ Created ${bidHistories.length} bid history entries`);

  // Create auto bid configurations
  const autoBids = await Promise.all([
    prisma.autoBid.upsert({
      where: { 
        auctionId_bidderId: {
          auctionId: 'auction-2',
          bidderId: 'user-5'
        }
      },
      update: {},
      create: {
        auctionId: 'auction-2',
        bidderId: 'user-5',
        maxAmount: 55000,
        increment: 500,
        isActive: true,
      },
    }),
    prisma.autoBid.upsert({
      where: { 
        auctionId_bidderId: {
          auctionId: 'auction-1',
          bidderId: 'user-4'
        }
      },
      update: {},
      create: {
        auctionId: 'auction-1',
        bidderId: 'user-4',
        maxAmount: 85000,
        increment: 1000,
        isActive: true,
      },
    }),
    prisma.autoBid.upsert({
      where: { 
        auctionId_bidderId: {
          auctionId: 'auction-3',
          bidderId: 'user-3'
        }
      },
      update: {},
      create: {
        auctionId: 'auction-3',
        bidderId: 'user-3',
        maxAmount: 240000,
        increment: 2000,
        isActive: false, // Deactivated after failed bid
      },
    }),
  ]);

  console.log(`✅ Created ${autoBids.length} auto bid configurations`);

  // Create bid validations
  const bidValidations = await Promise.all([
    prisma.bidValidation.create({
      data: {
        bidId: 'bid-1',
        auctionId: 'auction-1',
        bidderId: 'user-2',
        validations: {
          amountCheck: true,
          userVerification: true,
          auctionStatus: true,
          minimumIncrement: true,
          fundAvailability: true,
        },
        isValid: true,
        errors: [],
      },
    }),
    prisma.bidValidation.create({
      data: {
        bidId: 'bid-5',
        auctionId: 'auction-3',
        bidderId: 'user-2',
        validations: {
          amountCheck: true,
          userVerification: true,
          auctionStatus: true,
          minimumIncrement: true,
          fundAvailability: false,
        },
        isValid: false,
        errors: ['Insufficient funds verification failed'],
      },
    }),
  ]);

  console.log(`✅ Created ${bidValidations.length} bid validations`);

  console.log('🎉 Bid service database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding bid service database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });