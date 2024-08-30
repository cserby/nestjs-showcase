import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { WeatherApiResponse } from './dto/weatherApiResponse.dto';
import { lastValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Weather } from './entities/weather.entity';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    @InjectRepository(Weather)
    private readonly weatherRepository: Repository<Weather>,
    private httpService: HttpService,
  ) {}

  storeWeather(weatherApiResponse: WeatherApiResponse): Promise<Weather> {
    const weather: Weather = new Weather();
    weather.temperature = weatherApiResponse.main.temp;
    return this.weatherRepository.save(weather);
  }

  findAll(): Promise<Weather[]> {
    return this.weatherRepository.find();
  }

  async fetch() {
    const response$ = this.httpService.get<WeatherApiResponse>(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          lat: 44.34,
          lon: 10.99,
          appid: 'c808c3b5ad219bada7b3b3857e721b10',
        },
      },
    );

    const response = await lastValueFrom(response$);

    return response.data;
  }

  @Cron('45 * * * * *')
  async fetchAndStore() {
    const weatherApiResponse = await this.fetch();
    this.logger.log(
      `Fetched weather data: ${JSON.stringify(weatherApiResponse)}`,
    );
    return this.storeWeather(weatherApiResponse);
  }
}
