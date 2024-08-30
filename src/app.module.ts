import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LedgerModule } from './ledger/ledger.module';
import { WeatherModule } from './weather/weather.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Weather } from './weather/entities/weather.entity';

import { types as pgTypes } from 'pg';
import { ScheduleModule } from '@nestjs/schedule';

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
      entities: [Weather],
      database: 'postgres',
      synchronize: true,
      logging: true,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
