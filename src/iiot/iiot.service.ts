import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { IIOTDevice } from './entities/iiotDevice.entity';

@Injectable()
export class IIOTService {
  private readonly logger = new Logger(IIOTService.name);

  constructor(
    @InjectRepository(IIOTDevice)
    private readonly iiotDeviceRepository: Repository<IIOTDevice>,
  ) {}

  upsertDevice(device: Partial<IIOTDevice>): Promise<InsertResult> {
    return this.iiotDeviceRepository.upsert(device, {
      conflictPaths: ['deviceId'],
    });
  }

  findAll(): Promise<IIOTDevice[]> {
    return this.iiotDeviceRepository.find();
  }
}
