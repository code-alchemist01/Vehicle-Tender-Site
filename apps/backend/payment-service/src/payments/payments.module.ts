import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { PaymentMethodsController } from './payment-methods.controller';
import { PaymentMethodsService } from './payment-methods.service';
import { RefundsController } from './refunds.controller';
import { RefundsService } from './refunds.service';

@Module({
  imports: [HttpModule],
  controllers: [
    PaymentsController,
    PaymentMethodsController,
    RefundsController,
  ],
  providers: [
    PaymentsService,
    StripeService,
    PaymentMethodsService,
    RefundsService,
  ],
  exports: [PaymentsService, StripeService],
})
export class PaymentsModule {}