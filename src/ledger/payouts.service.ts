import { Injectable } from '@nestjs/common';
import { Payout } from './entities/payout.entity';
import { transactions as mockTransactions } from './mockData/transactions';

@Injectable()
export class PayoutsService {
  private readonly transactions = mockTransactions;

  getAll(): Payout[] {
    return Object.entries(
      this.transactions
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
}
