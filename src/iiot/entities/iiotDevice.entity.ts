import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum IIOTDeviceState {
  ON = 'on',
  OFF = 'off',
}

@Entity()
export class IIOTDevice {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn()
  @Unique('deviceId', ['deviceId'])
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

  @Column({ type: 'enum', enum: IIOTDeviceState, default: IIOTDeviceState.ON })
  state: IIOTDeviceState;
}
