import { Socket } from 'socket.io';

type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;

export const IIOTAuthWsMiddleware = (): SocketMiddleware => {
  return async (socket: Socket, next) => {
    try {
      const deviceId = socket.handshake?.auth?.deviceId;

      if (!deviceId) {
        throw new Error('Device ID is missing');
      }

      socket = Object.assign(socket, {
        deviceId: deviceId!,
      });

      next();
    } catch (error) {
      console.error(`Auth error: ${error.message}`);
      next(new Error('Unauthorized'));
    }
  };
};
