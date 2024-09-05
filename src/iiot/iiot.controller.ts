import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { IIOTService } from './iiot.service';
import {
  DeviceConfig,
  deviceConfigSchema,
} from './schemas/deviceConfig.schema';
import { ZodValidationPipe } from './pipes/zodValidation.pipe';

@Controller('iiot')
export class IIOTController {
  private readonly logger = new Logger(IIOTController.name);
  constructor(private readonly iiotService: IIOTService) {}

  @Get()
  findAll() {
    return this.iiotService.findAllDevices();
  }

  @Post(':deviceId')
  setConfig(
    @Body(
      new ZodValidationPipe(
        deviceConfigSchema,
        (msg) => new BadRequestException(msg),
      ),
    )
    config: DeviceConfig,
    @Param('deviceId') deviceId: string,
  ) {
    this.logger.log('Requesting set config', { deviceId, config });
    return this.iiotService.requestSetConfig(deviceId, config);
  }
}
