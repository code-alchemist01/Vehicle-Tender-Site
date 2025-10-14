import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { BidsController } from './bids.controller';
import { BidsService } from './bids.service';
import { BidProcessor } from './bid.processor';
import { BidValidationService } from './bid-validation.service';
import { AutoBidService } from './auto-bid.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'bid-processing',
    }),
    HttpModule,
  ],
  controllers: [BidsController],
  providers: [
    BidsService,
    BidProcessor,
    BidValidationService,
    AutoBidService,
  ],
  exports: [BidsService],
})
export class BidsModule {}