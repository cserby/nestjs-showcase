import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { io, Socket } from 'socket.io-client';
import * as request from 'supertest';

async function withSocket<T>(
  deviceId: string,
  use: (socket: Socket) => Promise<T>,
): Promise<T> {
  const socket = io('http://localhost:3000', { auth: { deviceId } });
  await new Promise<void>((resolve) => socket.on('connect', resolve));
  try {
    return await use(socket);
  } finally {
    socket.disconnect();
  }
}

describe('EventsGateway', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.listen(3000);
  });

  it('Tracks connection state', async () => {
    await withSocket('connectionStateTest', async (_socket) => {
      request(app.getHttpServer())
        .get('/iiot')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                deviceId: 'connectionStateTest',
                isConnected: true,
                lastConnection: expect.any(Date),
                lastDisconnection: null,
              }),
            ]),
          );
        });
    });

    request(app.getHttpServer())
      .get('/iiot')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              deviceId: 'connectionStateTest',
              isConnected: false,
              lastConnection: expect.any(Date),
              lastDisconnection: expect.any(Date),
            }),
          ]),
        );
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
