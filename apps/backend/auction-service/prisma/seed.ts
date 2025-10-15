import { PrismaClient, AuctionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding auction service database...');

  // Create auction categories
  const categories = await Promise.all([
    prisma.auctionCategory.upsert({
      where: { name: 'Luxury Cars' },
      update: {},
      create: {
        name: 'Luxury Cars',
        description: 'High-end luxury vehicles',
        isActive: true,
      },
    }),
    prisma.auctionCategory.upsert({
      where: { name: 'Classic Cars' },
      update: {},
      create: {
        name: 'Classic Cars',
        description: 'Vintage and classic automobiles',
        isActive: true,
      },
    }),
    prisma.auctionCategory.upsert({
      where: { name: 'Sports Cars' },
      update: {},
      create: {
        name: 'Sports Cars',
        description: 'High-performance sports vehicles',
        isActive: true,
      },
    }),
    prisma.auctionCategory.upsert({
      where: { name: 'Commercial Vehicles' },
      update: {},
      create: {
        name: 'Commercial Vehicles',
        description: 'Trucks, vans, and commercial vehicles',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} auction categories`);

  // Create sample auctions
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const auctions = await Promise.all([
    prisma.auction.upsert({
      where: { vehicleId: 'vehicle-1' },
      update: {},
      create: {
        title: '2023 BMW M4 Competition',
        description: 'Pristine condition BMW M4 with low mileage and full service history',
        vehicleId: 'vehicle-1',
        sellerId: 'user-1',
        startingPrice: 75000,
        currentPrice: 75000,
        reservePrice: 80000,
        minBidIncrement: 1000,
        startTime: now,
        endTime: oneDayFromNow,
        status: AuctionStatus.ACTIVE,
        isActive: true,
        isFeatured: true,
        totalBids: 0,
        viewCount: 125,
        watchlistCount: 8,
      },
    }),
    prisma.auction.upsert({
      where: { vehicleId: 'vehicle-2' },
      update: {},
      create: {
        title: '1967 Ford Mustang Fastback',
        description: 'Fully restored classic Mustang with original 390 V8 engine',
        vehicleId: 'vehicle-2',
        sellerId: 'user-2',
        startingPrice: 45000,
        currentPrice: 52000,
        reservePrice: 55000,
        minBidIncrement: 500,
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Started 2 hours ago
        endTime: twoDaysFromNow,
        status: AuctionStatus.ACTIVE,
        isActive: true,
        isFeatured: false,
        totalBids: 12,
        viewCount: 89,
        watchlistCount: 15,
        highestBidderId: 'user-3',
      },
    }),
    prisma.auction.upsert({
      where: { vehicleId: 'vehicle-3' },
      update: {},
      create: {
        title: '2024 Porsche 911 Turbo S',
        description: 'Brand new Porsche 911 Turbo S with all options',
        vehicleId: 'vehicle-3',
        sellerId: 'user-1',
        startingPrice: 220000,
        currentPrice: 220000,
        reservePrice: 230000,
        minBidIncrement: 2000,
        startTime: oneHourFromNow,
        endTime: threeDaysFromNow,
        status: AuctionStatus.SCHEDULED,
        isActive: false,
        isFeatured: true,
        totalBids: 0,
        viewCount: 67,
        watchlistCount: 22,
      },
    }),
    prisma.auction.upsert({
      where: { vehicleId: 'vehicle-4' },
      update: {},
      create: {
        title: '2022 Mercedes-AMG GT 63 S',
        description: 'Low mileage AMG GT with carbon fiber package',
        vehicleId: 'vehicle-4',
        sellerId: 'user-4',
        startingPrice: 150000,
        currentPrice: 165000,
        reservePrice: 170000,
        minBidIncrement: 1500,
        startTime: new Date(now.getTime() - 6 * 60 * 60 * 1000), // Started 6 hours ago
        endTime: new Date(now.getTime() + 18 * 60 * 60 * 1000), // Ends in 18 hours
        status: AuctionStatus.ACTIVE,
        isActive: true,
        isFeatured: false,
        totalBids: 8,
        viewCount: 156,
        watchlistCount: 11,
        highestBidderId: 'user-5',
      },
    }),
  ]);

  console.log(`✅ Created ${auctions.length} auctions`);

  // Create sample bids
  const bids = await Promise.all([
    // Bids for 1967 Ford Mustang
    prisma.bid.create({
      data: {
        auctionId: auctions[1].id,
        bidderId: 'user-3',
        amount: 46000,
        isWinning: false,
        isAutomatic: false,
      },
    }),
    prisma.bid.create({
      data: {
        auctionId: auctions[1].id,
        bidderId: 'user-5',
        amount: 48000,
        isWinning: false,
        isAutomatic: false,
      },
    }),
    prisma.bid.create({
      data: {
        auctionId: auctions[1].id,
        bidderId: 'user-3',
        amount: 52000,
        isWinning: true,
        isAutomatic: false,
      },
    }),
    // Bids for Mercedes-AMG GT 63 S
    prisma.bid.create({
      data: {
        auctionId: auctions[3].id,
        bidderId: 'user-2',
        amount: 152000,
        isWinning: false,
        isAutomatic: false,
      },
    }),
    prisma.bid.create({
      data: {
        auctionId: auctions[3].id,
        bidderId: 'user-5',
        amount: 165000,
        isWinning: true,
        isAutomatic: false,
      },
    }),
  ]);

  console.log(`✅ Created ${bids.length} bids`);

  // Create sample watchlists
  const watchlists = await Promise.all([
    prisma.watchlist.create({
      data: {
        auctionId: auctions[0].id,
        userId: 'user-2',
      },
    }),
    prisma.watchlist.create({
      data: {
        auctionId: auctions[0].id,
        userId: 'user-3',
      },
    }),
    prisma.watchlist.create({
      data: {
        auctionId: auctions[2].id,
        userId: 'user-4',
      },
    }),
    prisma.watchlist.create({
      data: {
        auctionId: auctions[2].id,
        userId: 'user-5',
      },
    }),
  ]);

  console.log(`✅ Created ${watchlists.length} watchlist entries`);

  console.log('🎉 Auction service database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding auction service database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });