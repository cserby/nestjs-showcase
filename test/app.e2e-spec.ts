import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/ledger/074092 (GET)', () => {
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
    return request(app.getHttpServer())
      .get('/payouts')
      .expect(200)
      .expect([{ userId: '074092', amount: 30 }]);
  });
});
