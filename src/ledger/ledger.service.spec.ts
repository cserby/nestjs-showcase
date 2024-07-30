import { Test, TestingModule } from '@nestjs/testing';
import { LedgerService } from './ledger.service';
import { HttpModule } from '@nestjs/axios';
import { TransactionService } from './transaction.service';

describe('LedgerService', () => {
  let service: LedgerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [LedgerService, TransactionService],
    }).compile();

    service = module.get<LedgerService>(LedgerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
