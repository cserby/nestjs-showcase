import { Injectable } from '@nestjs/common';
import { Payout } from './entities/payout.entity';
import { Transaction } from './entities/transaction.entity';
import { TransactionService } from './transaction.service';
import { getAll as getAllFromGenerator } from './generatorUtils';

@Injectable()
export class PayoutsService {
  constructor(private transactionService: TransactionService) {}

  private static payoutsFromTransactions(
    transactions: Transaction[],
  ): Payout[] {
    return Object.entries(
      transactions
        .filter((t) => t.type === 'payout')
        .reduce(
          (payouts, t) => {
            payouts[t.userId] = (payouts[t.userId] ?? 0) + t.amount;
            return payouts;
          },
          {} as Record<string, number>,
        ),
    ).map(([userId, amount]) => ({ userId, amount }));
  }

  async getAll(): Promise<Payout[]> {
    return PayoutsService.payoutsFromTransactions(
      await getAllFromGenerator(this.transactionService.transactions()),
    );
  }
}
