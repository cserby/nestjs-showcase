import { Module } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { LedgerController } from './ledger.controller';
import { PayoutsController } from './payouts.controller';
import { PayoutsService } from './payouts.service';
import { HttpModule } from '@nestjs/axios';
import { TransactionService } from './transaction.service';

@Module({
  imports: [HttpModule],
  controllers: [LedgerController, PayoutsController],
  providers: [LedgerService, PayoutsService, TransactionService],
})
export class LedgerModule {}
