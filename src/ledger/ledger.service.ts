import { Injectable } from '@nestjs/common';
import { Ledger } from './entities/ledger.entity';

@Injectable()
export class LedgerService {
  private readonly transactions = [
    {
      id: '41bbdf81-735c-4aea-beb3-3e5f433a30c5',
      userId: '074092',
      createdAt: new Date('2023-03-16T12:33:11.000Z'),
      type: 'payout',
      amount: 30,
    },
    {
      id: '41bbdf81-735c-4aea-beb3-3e5fasfsdfef',
      userId: '074092',
      createdAt: new Date('2023-03-12T12:33:11.000Z'),
      type: 'spent',
      amount: 12,
    },
    {
      id: '41bbdf81-735c-4aea-beb3-342jhj234nj234',
      userId: '074092',
      createdAt: new Date('2023-03-15T12:33:11.000Z'),
      type: 'earned',
      amount: 1.2,
    },
  ];

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
