import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
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
import { DeviceConfig } from '../schemas/deviceConfig.schema';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class IIOTGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly deviceIdSocketMap = new Map<string, Socket>();

  constructor(private readonly iiotService: IIOTService) {}

  @WebSocketServer() server: Server = new Server<
    ServerToClientEvents,
    ClientToServerEvents
  >();

  private readonly logger = new Logger(IIOTGateway.name);

  async afterInit() {
    this.server.use(IIOTAuthWsMiddleware(this.logger));
    this.iiotService.setConfigMessage$.subscribe(this.setConfig.bind(this));
  }

  getDeviceId(client: Socket): string {
    return client.handshake.auth.deviceId;
  }

  handleConnection(client: Socket) {
    const deviceId = this.getDeviceId(client);
    this.deviceIdSocketMap.set(deviceId, client);
    this.iiotService.upsertDevice({
      deviceId,
      isConnected: true,
      lastConnection: new Date(),
    });
    this.logger.log(`Client connected: ${deviceId}`);
  }

  handleDisconnect(client: Socket) {
    const deviceId = this.getDeviceId(client);
    this.deviceIdSocketMap.delete(deviceId);
    this.iiotService.upsertDevice({
      deviceId,
      isConnected: false,
      lastDisconnection: new Date(),
    });
    this.logger.log(`Client disconnected: ${deviceId}`);
  }

  @SubscribeMessage('telemetry')
  ingestTelemetry(
    @MessageBody(
      new ZodValidationPipe(sendTelemetrySchema, (msg) => new WsException(msg)),
    )
    data: SendTelemetry,
    @ConnectedSocket() client: Socket,
  ) {
    const deviceId = this.getDeviceId(client);
    this.iiotService.insertTelemetry(deviceId, data.telemetry);
    this.logger.log(`Received telemetry from ${deviceId}: ${data}`);
    return { event: 'ack', messageId: data.messageId };
  }

  setConfig(
    @MessageBody() setConfigMessage: { deviceId: string; config: DeviceConfig },
  ) {
    this.logger.log('Requesting set config', setConfigMessage);

    const { deviceId, config } = setConfigMessage;
    const deviceSocket = this.deviceIdSocketMap.get(deviceId);

    if (!deviceSocket) {
      this.logger.error(`Device with ID ${deviceId} not connected`);
      throw new Error(`Device with ID ${deviceId} not connected`);
    }

    deviceSocket.emit('setConfig', config);
  }
}
