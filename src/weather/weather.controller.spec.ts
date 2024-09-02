import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Weather } from './entities/weather.entity';
import { HttpModule } from '@nestjs/axios';

describe('WeatherController', () => {
  let controller: WeatherController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [WeatherController],
      providers: [
        WeatherService,
        {
          provide: getRepositoryToken(Weather),
          useFactory: () => ({
            getAll: jest.fn(),
          }),
        },
      ],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
