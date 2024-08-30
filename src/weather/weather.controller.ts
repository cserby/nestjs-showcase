import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherApiResponse } from './dto/weatherApiResponse.dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  findAll() {
    return this.weatherService.findAll();
  }

  @Post()
  async fetch() {
    return await this.weatherService.fetch();
  }

  @Put()
  store(@Body() weatherApiResponse: WeatherApiResponse) {
    return this.weatherService.storeWeather(weatherApiResponse);
  }
}
