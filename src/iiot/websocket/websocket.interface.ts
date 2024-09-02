import { z } from 'zod';

export const telemetrySchema = z.object({
  timestamp: z.coerce.date(),
  sensorA: z.number().positive(),
  sensorB: z.number(),
});

export type Telemetry = z.infer<typeof telemetrySchema>;

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
}

export interface ClientToServerEvents {
  telemetry: (e: SendTelemetry) => void;
}
