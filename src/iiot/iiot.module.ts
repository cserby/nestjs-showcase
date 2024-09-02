import { Module } from '@nestjs/common';
import { IIOTGateway } from './websocket/iiot.gateway';
import { IIOTService } from './iiot.service';
import { IIOTController } from './iiot.controller';
import { IIOTDevice } from './entities/iiotDevice.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IIOTDeviceTelemetry } from './entities/iiotDeviceTelemetry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([IIOTDevice]),
    TypeOrmModule.forFeature([IIOTDeviceTelemetry]),
  ],
  providers: [IIOTGateway, IIOTService],
  controllers: [IIOTController],
})
export class IIOTModule {}
