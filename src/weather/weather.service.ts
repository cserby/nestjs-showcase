import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { WeatherApiResponse } from './dto/weatherApiResponse.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class WeatherService {
  constructor(private httpService: HttpService) {}

  findAll() {
    return `This action returns all weather`;
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
}
