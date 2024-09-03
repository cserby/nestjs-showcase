import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { io, Socket } from 'socket.io-client';
import * as request from 'supertest';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from 'src/iiot/websocket/websocket.interface';

async function withSocket<T>(
  deviceId: string,
  use: (
    socket: Socket<ServerToClientEvents, ClientToServerEvents>,
  ) => Promise<T>,
): Promise<T> {
  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    'http://localhost:3000',
    { auth: { deviceId } },
  );
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

  describe('Connection', () => {
    it('Requires deviceId', async () => {
      const socket = io('http://localhost:3000');
      await new Promise<void>((resolve) =>
        socket.on('connect_error', (err) => {
          expect(err.message).toBe('Unauthorized');
          resolve();
        }),
      );
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
  });

  describe('Telemetry', () => {
    it.only('Validates telemetry input shape', async () => {
      await withSocket('telemetryTest', async (socket) => {
        await new Promise<void>((resolve) => {
          socket.on('disconnect', () => {
            resolve();
          });
          // @ts-expect-error Invalid shape for telemetry
          socket.emit('telemetry', { messageId: 42 });
        });
      });
    });

    it('Ingests telemetry', async () => {
      await withSocket('telemetryTest', async (socket) => {
        Array(5)
          .fill(null)
          .forEach((_, i) =>
            socket.emit('telemetry', {
              messageId: 342 + i,
              telemetry: {
                timestamp: new Date(),
                sensorA: 42 + i,
                sensorB: 1337,
              },
            }),
          );
      });

      request(app.getHttpServer())
        .get('/iiot')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                deviceId: 'telemetryTest',
                telemetries: expect.arrayContaining([
                  expect.objectContaining({
                    timestamp: expect.any(Date),
                    sensorA: 42,
                    sensorB: 1337,
                  }),
                  expect.objectContaining({
                    timestamp: expect.any(Date),
                    sensorA: 43,
                    sensorB: 1337,
                  }),
                ]),
              }),
            ]),
          );
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
