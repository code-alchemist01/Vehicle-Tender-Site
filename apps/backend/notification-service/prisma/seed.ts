import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding notification service database...');

  // Create email templates
  const emailTemplates = await Promise.all([
    prisma.emailTemplate.upsert({
      where: { name: 'auction_created' },
      update: {},
      create: {
        name: 'auction_created',
        subject: 'Your auction "{{auctionTitle}}" has been created',
        htmlBody: '<h2>Auction Created Successfully</h2><p>Dear {{sellerName}},</p><p>Your auction for <strong>{{auctionTitle}}</strong> has been created and will start on {{startDate}}.</p><p><strong>Starting Price:</strong> ${{startingPrice}}</p><p><strong>Reserve Price:</strong> ${{reservePrice}}</p><p>You can monitor your auction progress in your dashboard.</p><p>Best regards,<br>Vehicle Auction Platform</p>',
        textBody: 'Your auction "{{auctionTitle}}" has been created and will start on {{startDate}}. Starting price: ${{startingPrice}}',
        variables: {
          'auctionTitle': 'string',
          'sellerName': 'string',
          'startDate': 'datetime',
          'startingPrice': 'number',
          'reservePrice': 'number'
        },
      },
    }),
    prisma.emailTemplate.upsert({
      where: { name: 'bid_placed' },
      update: {},
      create: {
        name: 'bid_placed',
        subject: 'New bid placed on "{{auctionTitle}}"',
        htmlBody: '<h2>New Bid Placed</h2><p>Dear {{sellerName}},</p><p>A new bid of <strong>${{bidAmount}}</strong> has been placed on your auction "{{auctionTitle}}".</p><p><strong>Current highest bid:</strong> ${{currentPrice}}</p><p><strong>Total bids:</strong> {{totalBids}}</p><p>View your auction details in your dashboard.</p><p>Best regards,<br>Vehicle Auction Platform</p>',
        textBody: 'New bid of ${{bidAmount}} placed on "{{auctionTitle}}". Current highest: ${{currentPrice}}',
        variables: {
          'auctionTitle': 'string',
          'sellerName': 'string',
          'bidAmount': 'number',
          'currentPrice': 'number',
          'totalBids': 'number'
        },
      },
    }),
    prisma.emailTemplate.upsert({
      where: { name: 'bid_outbid' },
      update: {},
      create: {
        name: 'bid_outbid',
        subject: 'You have been outbid on "{{auctionTitle}}"',
        htmlBody: '<h2>You Have Been Outbid</h2><p>Dear {{bidderName}},</p><p>Your bid of <strong>${{yourBid}}</strong> on "{{auctionTitle}}" has been outbid.</p><p><strong>New highest bid:</strong> ${{newHighestBid}}</p><p><strong>Time remaining:</strong> {{timeRemaining}}</p><p>Place a new bid to stay in the running!</p><p>Best regards,<br>Vehicle Auction Platform</p>',
        textBody: 'Your bid of ${{yourBid}} on "{{auctionTitle}}" has been outbid. New highest: ${{newHighestBid}}',
        variables: {
          auctionTitle: 'string',
          bidderName: 'string',
          yourBid: 'number',
          newHighestBid: 'number',
          timeRemaining: 'string'
        },
      },
    }),
    prisma.emailTemplate.upsert({
      where: { name: 'auction_won' },
      update: {},
      create: {
        name: 'auction_won',
        subject: 'Congratulations! You won "{{auctionTitle}}"',
        htmlBody: '<h2>Congratulations! You Won the Auction</h2><p>Dear {{winnerName}},</p><p>You have successfully won the auction for <strong>{{auctionTitle}}</strong>!</p><p><strong>Winning bid:</strong> ${{winningBid}}</p><p><strong>Payment due:</strong> {{paymentDueDate}}</p><p>Please complete your payment within 48 hours to secure your purchase.</p><p>Best regards,<br>Vehicle Auction Platform</p>',
        textBody: 'Congratulations! You won "{{auctionTitle}}" with a bid of ${{winningBid}}. Payment due: {{paymentDueDate}}',
        variables: {
          auctionTitle: 'string',
          winnerName: 'string',
          winningBid: 'number',
          paymentDueDate: 'datetime'
        },
      },
    }),
    prisma.emailTemplate.upsert({
      where: { name: 'payment_received' },
      update: {},
      create: {
        name: 'payment_received',
        subject: 'Payment received for "{{auctionTitle}}"',
        htmlBody: '<h2>Payment Received</h2><p>Dear {{buyerName}},</p><p>We have successfully received your payment of <strong>${{paymentAmount}}</strong> for "{{auctionTitle}}".</p><p><strong>Transaction ID:</strong> {{transactionId}}</p><p>The seller will be in touch with you shortly regarding vehicle pickup/delivery.</p><p>Best regards,<br>Vehicle Auction Platform</p>',
        textBody: 'Payment of ${{paymentAmount}} received for "{{auctionTitle}}". Transaction ID: {{transactionId}}',
        variables: {
          auctionTitle: 'string',
          buyerName: 'string',
          paymentAmount: 'number',
          transactionId: 'string'
        },
      },
    }),
  ]);

  console.log(`✅ Created ${emailTemplates.length} email templates`);

  // Create notification preferences for users
  const notificationPreferences = await Promise.all([
    prisma.notificationPreference.upsert({
      where: { userId: 'user-1' },
      update: {},
      create: {
        userId: 'user-1',
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        auctionUpdates: true,
        bidUpdates: true,
        paymentUpdates: true,
        marketingEmails: false,
      },
    }),
    prisma.notificationPreference.upsert({
      where: { userId: 'user-2' },
      update: {},
      create: {
        userId: 'user-2',
        emailEnabled: true,
        pushEnabled: false,
        smsEnabled: true,
        auctionUpdates: true,
        bidUpdates: true,
        paymentUpdates: true,
        marketingEmails: true,
      },
    }),
    prisma.notificationPreference.upsert({
      where: { userId: 'user-3' },
      update: {},
      create: {
        userId: 'user-3',
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        auctionUpdates: true,
        bidUpdates: true,
        paymentUpdates: true,
        marketingEmails: false,
      },
    }),
    prisma.notificationPreference.upsert({
      where: { userId: 'user-4' },
      update: {},
      create: {
        userId: 'user-4',
        emailEnabled: false,
        pushEnabled: true,
        smsEnabled: false,
        auctionUpdates: true,
        bidUpdates: true,
        paymentUpdates: true,
        marketingEmails: false,
      },
    }),
    prisma.notificationPreference.upsert({
      where: { userId: 'user-5' },
      update: {},
      create: {
        userId: 'user-5',
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: true,
        auctionUpdates: true,
        bidUpdates: true,
        paymentUpdates: true,
        marketingEmails: true,
      },
    }),
  ]);

  console.log(`✅ Created ${notificationPreferences.length} notification preferences`);

  // Create sample notifications
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userId: 'user-1',
        type: NotificationType.AUCTION_CREATED,
        title: 'Auction Created',
        message: 'Your auction for "2023 BMW M4 Competition" has been created successfully',
        data: {
          auctionId: 'auction-1',
          auctionTitle: '2023 BMW M4 Competition',
          startingPrice: 75000,
        },
        read: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    }),
    prisma.notification.create({
      data: {
        userId: 'user-2',
        type: NotificationType.BID_PLACED,
        title: 'New Bid Placed',
        message: 'A new bid of $76,000 has been placed on your auction',
        data: {
          auctionId: 'auction-1',
          bidAmount: 76000,
          bidderId: 'user-2',
        },
        read: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    }),
    prisma.notification.create({
      data: {
        userId: 'user-2',
        type: NotificationType.BID_OUTBID,
        title: 'You Have Been Outbid',
        message: 'Your bid on "2023 BMW M4 Competition" has been outbid',
        data: {
          auctionId: 'auction-1',
          yourBid: 76000,
          newHighestBid: 77500,
        },
        read: false,
        createdAt: new Date(Date.now() - 90 * 60 * 1000), // 90 minutes ago
      },
    }),
    prisma.notification.create({
      data: {
        userId: 'user-3',
        type: NotificationType.BID_WON,
        title: 'Congratulations! You Won',
        message: 'You won the auction for "2023 BMW M4 Competition" with a bid of $77,500',
        data: {
          auctionId: 'auction-1',
          winningBid: 77500,
          auctionTitle: '2023 BMW M4 Competition',
        },
        read: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
    }),
    prisma.notification.create({
      data: {
        userId: 'user-3',
        type: NotificationType.PAYMENT_REQUIRED,
        title: 'Payment Required',
        message: 'Please complete payment for your winning bid within 48 hours',
        data: {
          auctionId: 'auction-1',
          paymentAmount: 77500,
          paymentDueDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
        read: false,
        createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      },
    }),
    prisma.notification.create({
      data: {
        userId: 'user-5',
        type: NotificationType.AUCTION_ENDING_SOON,
        title: 'Auction Ending Soon',
        message: 'The auction for "1967 Ford Mustang Fastback" ends in 2 hours',
        data: {
          auctionId: 'auction-2',
          auctionTitle: '1967 Ford Mustang Fastback',
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        },
        read: false,
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      },
    }),
    prisma.notification.create({
      data: {
        userId: 'user-1',
        type: NotificationType.PAYMENT_RECEIVED,
        title: 'Payment Received',
        message: 'Payment of $77,500 has been received for your auction',
        data: {
          auctionId: 'auction-1',
          paymentAmount: 77500,
          buyerId: 'user-3',
          transactionId: 'pi_1234567890abcdef',
        },
        read: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
    }),
  ]);

  console.log(`✅ Created ${notifications.length} notifications`);

  console.log('🎉 Notification service database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding notification service database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });