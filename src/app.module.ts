import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LedgerModule } from './ledger/ledger.module';
import { WeatherModule } from './weather/weather.module';

@Module({
  imports: [LedgerModule, WeatherModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
