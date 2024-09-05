import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IIOTAuthWsMiddleware } from '../middlewares/iiotAuth.wsMiddleware';
import { IIOTService } from '../iiot.service';
import {
  ClientToServerEvents,
  SendTelemetry,
  sendTelemetrySchema,
  ServerToClientEvents,
} from './websocket.interface';
import { Logger } from '@nestjs/common';
import { ZodValidationPipe } from '../pipes/zodValidation.pipe';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class IIOTGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly iiotService: IIOTService) {}

  @WebSocketServer() server: Server = new Server<
    ServerToClientEvents,
    ClientToServerEvents
  >();

  private readonly logger = new Logger(IIOTGateway.name);

  async afterInit() {
    this.server.use(IIOTAuthWsMiddleware(this.logger));
  }

  getDeviceId(client: Socket): string {
    return client.handshake.auth.deviceId;
  }

  handleConnection(client: Socket) {
    const deviceId = this.getDeviceId(client);
    this.iiotService.upsertDevice({
      deviceId,
      isConnected: true,
      lastConnection: new Date(),
    });
    this.logger.log(`Client connected: ${deviceId}`);
  }

  handleDisconnect(client: Socket) {
    const deviceId = this.getDeviceId(client);
    this.iiotService.upsertDevice({
      deviceId,
      isConnected: false,
      lastDisconnection: new Date(),
    });
    this.logger.log(`Client disconnected: ${deviceId}`);
  }

  @SubscribeMessage('telemetry')
  ingestTelemetry(
    @MessageBody(new ZodValidationPipe(sendTelemetrySchema))
    data: SendTelemetry,
    @ConnectedSocket() client: Socket,
  ) {
    const deviceId = this.getDeviceId(client);
    this.iiotService.insertTelemetry(deviceId, data.telemetry);
    this.server.to(client.id).emit('ack', { messageId: data.messageId });
    this.logger.log(`Received telemetry from ${deviceId}: ${data}`);
  }
}
