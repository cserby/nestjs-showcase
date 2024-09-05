import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IIOTDevice } from './iiotDevice.entity';

@Entity()
export class IIOTDeviceTelemetry {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => IIOTDevice, (device) => device.telemetries)
  device: IIOTDevice;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'float' })
  sensorA: number;

  @Column({ type: 'float' })
  sensorB: number;
}
