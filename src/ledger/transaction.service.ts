import { Injectable } from '@nestjs/common';
import { Transaction } from './entities/transaction.entity';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

export class TransactionsApiResponse {
  items: Transaction[];
  metadata: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

@Injectable()
export class TransactionService {
  constructor(private httpService: HttpService) {}

  async *transactions(
    startDate?: string,
    endDate?: string,
  ): AsyncGenerator<Transaction> {
    let page = 1;

    while (true) {
      const response$ = this.httpService.get<TransactionsApiResponse>(
        '/transactions',
        {
          params: {
            startDate,
            endDate,
            page,
          },
        },
      );

      const response = await lastValueFrom(response$);

      for (const transaction of response.data.items) {
        yield transaction;
      }

      if (
        response.data.metadata.currentPage >= response.data.metadata.totalPages
      ) {
        return;
      } else {
        page++;
      }
    }
  }
}
