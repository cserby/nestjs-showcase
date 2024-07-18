import { Module } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { LedgerController } from './ledger.controller';
import { PayoutsController } from './payouts.controller';
import { PayoutsService } from './payouts.service';

@Module({
  controllers: [LedgerController, PayoutsController],
  providers: [LedgerService, PayoutsService],
})
export class LedgerModule {}
