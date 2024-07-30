import { Test, TestingModule } from '@nestjs/testing';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';
import { Transaction } from './entities/transaction.entity';
import { TransactionService } from './transaction.service';
import { HttpModule } from '@nestjs/axios';

describe('LedgerController', () => {
  let controller: LedgerController;
  let transactionService: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [LedgerController],
      providers: [LedgerService, TransactionService],
    }).compile();

    controller = module.get<LedgerController>(LedgerController);
    transactionService = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('existing ledger', async () => {
    async function* mockTransactions(): AsyncGenerator<Transaction> {
      for (const tr of [
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
      ] satisfies Transaction[]) {
        yield tr;
      }
    }

    jest
      .spyOn(transactionService, 'transactions')
      .mockImplementation(mockTransactions);

    await expect(controller.findOne('074092')).resolves.toEqual(
      expect.objectContaining({ userId: '074092' }),
    );
  });
});
