import { Injectable } from '@nestjs/common';
import { Ledger } from './entities/ledger.entity';
import { Transaction } from './entities/transaction.entity';
import { TransactionService } from './transaction.service';
import { getAll } from './generatorUtils';

@Injectable()
export class LedgerService {
  constructor(private transactionService: TransactionService) {}

  private static ledgerForUserId(
    userId: string,
    transactions: Transaction[],
  ): Ledger {
    return transactions
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

  async forUserId(userId: string): Promise<Ledger> {
    return LedgerService.ledgerForUserId(
      userId,
      await getAll(this.transactionService.transactions()),
    );
  }
}
