import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { IIOTDevice } from './entities/iiotDevice.entity';
import { IIOTDeviceTelemetry } from './entities/iiotDeviceTelemetry.entity';
import { Subject } from 'rxjs';
import { Telemetry } from './schemas/telemetry.schema';
import { DeviceConfig } from './schemas/deviceConfig.schema';

@Injectable()
export class IIOTService {
  private readonly logger = new Logger(IIOTService.name);

  private readonly setConfigMessage$$ = new Subject<{
    deviceId: string;
    config: DeviceConfig;
  }>();

  readonly setConfigMessage$ = this.setConfigMessage$$.asObservable();

  constructor(
    @InjectRepository(IIOTDevice)
    private readonly iiotDeviceRepository: Repository<IIOTDevice>,
    @InjectRepository(IIOTDeviceTelemetry)
    private readonly iiotDeviceTelemetryRepository: Repository<IIOTDeviceTelemetry>,
  ) {}

  upsertDevice(device: Partial<IIOTDevice>): Promise<InsertResult> {
    return this.iiotDeviceRepository.upsert(device, {
      conflictPaths: ['deviceId'],
    });
  }

  findAllDevices(): Promise<IIOTDevice[]> {
    return this.iiotDeviceRepository.find({ relations: ['telemetries'] });
  }

  findDeviceById(deviceId: string): Promise<IIOTDevice | null> {
    return this.iiotDeviceRepository.findOne({ where: { deviceId } });
  }

  async insertTelemetry(
    deviceId: string,
    telemetry: Telemetry,
  ): Promise<InsertResult> {
    const device = await this.findDeviceById(deviceId);
    if (device === null) {
      throw new Error(`Device with ID ${deviceId} not found`);
    }

    const telemetryEntity = new IIOTDeviceTelemetry();
    telemetryEntity.device = device;
    telemetryEntity.timestamp = telemetry.timestamp;
    telemetryEntity.sensorA = telemetry.sensorA;
    telemetryEntity.sensorB = telemetry.sensorB;

    return this.iiotDeviceTelemetryRepository.insert(telemetryEntity);
  }

  requestSetConfig(deviceId: string, config: DeviceConfig): void {
    this.logger.log('Requesting set config', { deviceId, config });
    if (!this.findDeviceById(deviceId)) {
      throw new Error(`Device with ID ${deviceId} not found`);
    }
    this.setConfigMessage$$.next({ deviceId, config });
  }
}
