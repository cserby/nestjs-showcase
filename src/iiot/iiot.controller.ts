import { Controller, Get } from '@nestjs/common';
import { IIOTService } from './iiot.service';

@Controller('iiot')
export class IIOTController {
  constructor(private readonly iiotService: IIOTService) {}

  @Get()
  findAll() {
    return this.iiotService.findAllDevices();
  }
}
