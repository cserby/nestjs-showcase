import { Injectable } from '@nestjs/common';
import { Ledger } from './entities/ledger.entity';
import { transactions as mockTransactions } from './mockData/transactions';

@Injectable()
export class LedgerService {
  private readonly transactions = mockTransactions;

  forUserId(userId: string): Ledger {
    return this.transactions
      .filter((t) => t.userId === userId)
      .reduce(
        (ldgr, t) => {
          switch (t.type) {
            case 'earned':
              ldgr.earned += t.amount;
              ldgr.balance += t.amount;
              break;
            case 'payout':
              ldgr.paidOut += t.amount;
              ldgr.balance -= t.amount;
              break;
            case 'spent':
              ldgr.spent += t.amount;
              ldgr.balance -= t.amount;
              break;
            default:
              throw new Error(`Unknown transaction type: ${t.type}`);
          }
          return ldgr;
        },
        {
          userId,
          balance: 0,
          earned: 0,
          spent: 0,
          paidOut: 0,
        },
      );
  }
}
