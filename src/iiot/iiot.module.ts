import { Module } from '@nestjs/common';
import { IIOTGateway } from './iiot.gateway';
import { IIOTService } from './iiot.service';
import { IIOTController } from './iiot.controller';
import { IIOTDevice } from './entities/iiotDevice.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([IIOTDevice])],
  providers: [IIOTGateway, IIOTService],
  controllers: [IIOTController],
})
export class IIOTModule {}
