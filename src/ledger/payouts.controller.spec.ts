import { Test, TestingModule } from '@nestjs/testing';
import { PayoutsController } from './payouts.controller';
import { PayoutsService } from './payouts.service';
import { TransactionService } from './transaction.service';
import { HttpModule } from '@nestjs/axios';
import { Transaction } from './entities/transaction.entity';

describe('PayoutsController', () => {
  let controller: PayoutsController;
  let transactionService: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [PayoutsController],
      providers: [PayoutsService, TransactionService],
    }).compile();

    controller = module.get<PayoutsController>(PayoutsController);
    transactionService = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('existing Payouts', async () => {
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

    await expect(controller.findAll()).resolves.toEqual([
      { userId: '074092', amount: 30 },
    ]);
  });
});
