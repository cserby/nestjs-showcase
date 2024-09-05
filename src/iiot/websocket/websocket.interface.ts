import { z } from 'zod';
import { telemetrySchema } from '../schemas/telemetry.schema';
import { DeviceConfig } from '../schemas/deviceConfig.schema';

export const sendTelemetrySchema = z.object({
  messageId: z.number().int(),
  telemetry: telemetrySchema,
});

export type SendTelemetry = z.infer<typeof sendTelemetrySchema>;

export const ackSchema = z.object({
  messageId: z.number().int(),
});

export type Ack = z.infer<typeof ackSchema>;

export interface ServerToClientEvents {
  ack: (e: Ack) => void;
  exception: (e: { status: string; message: string }) => void;
  setConfig: (c: DeviceConfig) => void;
}

export interface ClientToServerEvents {
  telemetry: (e: SendTelemetry) => void;
  config: (c: DeviceConfig) => void;
}
