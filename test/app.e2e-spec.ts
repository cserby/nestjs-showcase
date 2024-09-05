import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { AxiosHeaders, AxiosResponse } from 'axios';
import { TransactionsApiResponse } from 'src/ledger/transaction.service';
import { execSync } from 'child_process';

function mockTransactionServiceResponse(): Observable<
  AxiosResponse<TransactionsApiResponse>
> {
  return new Observable((s) => {
    s.next({
      data: {
        items: [
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
        ],
        metadata: {
          totalItems: 3,
          itemCount: 3,
          itemsPerPage: 3,
          totalPages: 1,
          currentPage: 1,
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: new AxiosHeaders(),
      },
    } satisfies AxiosResponse<TransactionsApiResponse>);
    s.complete();
  });
}

beforeAll(() => {
  console.log('Starting db');
  execSync('yarn db:start');
});

afterAll(() => {
  console.log('Stopping db');
  execSync('yarn db:stop');
});

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let httpService: HttpService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    httpService = moduleFixture.get<HttpService>(HttpService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/ledger/074092 (GET)', () => {
    jest
      .spyOn(httpService, 'get')
      .mockImplementation(mockTransactionServiceResponse);

    return request(app.getHttpServer())
      .get('/ledger/074092')
      .expect(200)
      .expect({
        userId: '074092',
        balance: -40.8,
        earned: 1.2,
        spent: 12,
        paidOut: 30,
      });
  });

  it('/ledger/nonExistentUser (GET)', () => {
    jest
      .spyOn(httpService, 'get')
      .mockImplementation(mockTransactionServiceResponse);

    return request(app.getHttpServer())
      .get('/ledger/nonExistentUser')
      .expect(200)
      .expect({
        userId: 'nonExistentUser',
        balance: 0,
        earned: 0,
        spent: 0,
        paidOut: 0,
      });
  });

  it('/payouts (GET)', () => {
    jest
      .spyOn(httpService, 'get')
      .mockImplementation(mockTransactionServiceResponse);

    return request(app.getHttpServer())
      .get('/payouts')
      .expect(200)
      .expect([{ userId: '074092', amount: 30 }]);
  });

  describe('/payouts (POST)', () => {
    it('input validation - negative', () => {
      return request(app.getHttpServer())
        .post('/payouts')
        .send({ userId: '074092', amount: -30 })
        .expect(400);
    });

    it('input validation - positive', () => {
      return request(app.getHttpServer())
        .post('/payouts')
        .send({ userId: '074092', amount: 30 })
        .expect(201);
    });
  });

  describe('WeatherModule', () => {
    it('fetch', () => {
      return request(app.getHttpServer()).post('/weather').expect(201);
    });
  });
});
