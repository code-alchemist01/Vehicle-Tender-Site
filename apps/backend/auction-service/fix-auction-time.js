// Script to fix auction startTime timezone issues
// Usage: node fix-auction-time.js <auction-id> [new-start-time-iso]

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAuctionTime(auctionId, newStartTime = null) {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
    });

    if (!auction) {
      console.error(`Auction with ID ${auctionId} not found`);
      process.exit(1);
    }

    console.log('Current auction data:');
    console.log(`  ID: ${auction.id}`);
    console.log(`  Title: ${auction.title}`);
    console.log(`  Status: ${auction.status}`);
    console.log(`  StartTime (UTC): ${auction.startTime.toISOString()}`);
    console.log(`  StartTime (TR): ${auction.startTime.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}`);
    console.log(`  EndTime (UTC): ${auction.endTime.toISOString()}`);
    console.log(`  EndTime (TR): ${auction.endTime.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}`);

    const now = new Date();
    console.log(`\nCurrent time (UTC): ${now.toISOString()}`);
    console.log(`Current time (TR): ${now.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}`);

    const diff = auction.startTime.getTime() - now.getTime();
    const minutesUntilStart = Math.floor(diff / 1000 / 60);
    console.log(`\nTime until start: ${minutesUntilStart} minutes`);

    if (newStartTime) {
      const newStart = new Date(newStartTime);
      console.log(`\nUpdating startTime to: ${newStart.toISOString()} (UTC)`);
      console.log(`Which is: ${newStart.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })} (TR)`);

      const updated = await prisma.auction.update({
        where: { id: auctionId },
        data: {
          startTime: newStart,
          // If new start time is in the past, also update status to ACTIVE
          ...(newStart <= now && {
            status: 'ACTIVE',
            isActive: true,
          }),
        },
      });

      console.log('\n✅ Auction updated successfully!');
      console.log(`New status: ${updated.status}`);
    } else {
      // Suggest fixing the time if it's clearly wrong
      if (minutesUntilStart > 60) {
        console.log('\n💡 Suggestion: Start time seems to be in the future.');
        console.log('   If you want to start the auction now, run:');
        console.log(`   node fix-auction-time.js ${auctionId} ${now.toISOString()}`);
      } else if (minutesUntilStart < -5 && auction.status === 'SCHEDULED') {
        console.log('\n⚠️  Warning: Start time has passed but auction is still SCHEDULED.');
        console.log('   This might be a timezone issue.');
        console.log('   To fix and start now, run:');
        console.log(`   node fix-auction-time.js ${auctionId} ${now.toISOString()}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const auctionId = process.argv[2];
const newStartTime = process.argv[3];

if (!auctionId) {
  console.error('Usage: node fix-auction-time.js <auction-id> [new-start-time-iso]');
  console.error('Example: node fix-auction-time.js cmhrtmjtr000013y56wlpu0fm');
  console.error('Example: node fix-auction-time.js cmhrtmjtr000013y56wlpu0fm 2025-11-09T14:00:00.000Z');
  process.exit(1);
}

fixAuctionTime(auctionId, newStartTime);

