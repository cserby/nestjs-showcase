import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { IIOTAuthWsMiddleware } from './iiotAuth.wsMiddleware';
import { IIOTService } from './iiot.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class IIOTGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly iiotService: IIOTService) {}

  async afterInit() {
    this.server.use(IIOTAuthWsMiddleware());
  }

  getDeviceId(client: Socket): string {
    return client.handshake.auth.deviceId;
  }

  handleConnection(client: Socket) {
    this.iiotService.upsertDevice({
      deviceId: this.getDeviceId(client),
      isConnected: true,
      lastConnection: new Date(),
    });
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected');
    this.iiotService.upsertDevice({
      deviceId: this.getDeviceId(client),
      isConnected: false,
      lastDisconnection: new Date(),
    });
  }

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }
}
