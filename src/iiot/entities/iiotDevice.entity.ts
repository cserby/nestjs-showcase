import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { IIOTDeviceTelemetry } from './iiotDeviceTelemetry.entity';

@Entity()
export class IIOTDevice {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn()
  @Unique('deviceId', ['deviceId'])
  @Index({ unique: true })
  deviceId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'bool', default: false })
  isConnected: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastConnection: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastDisconnection: Date;

  @OneToMany(() => IIOTDeviceTelemetry, (telemetry) => telemetry.device)
  telemetries: IIOTDeviceTelemetry[];
}
