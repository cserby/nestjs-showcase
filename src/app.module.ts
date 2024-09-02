import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LedgerModule } from './ledger/ledger.module';
import { WeatherModule } from './weather/weather.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Weather } from './weather/entities/weather.entity';

import { types as pgTypes } from 'pg';
import { ScheduleModule } from '@nestjs/schedule';
import { IIOTModule } from './iiot/iiot.module';
import { IIOTDevice } from './iiot/entities/iiotDevice.entity';

pgTypes.setTypeParser(pgTypes.builtins.NUMERIC, (val) => Number(val));

@Module({
  imports: [
    LedgerModule,
    WeatherModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      password: 'mysecretpassword',
      username: 'postgres',
      entities: [Weather, IIOTDevice],
      database: 'postgres',
      synchronize: true,
      logging: true,
    }),
    ScheduleModule.forRoot(),
    IIOTModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
