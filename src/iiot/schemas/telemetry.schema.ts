import { z } from 'zod';

export const telemetrySchema = z.object({
  timestamp: z.coerce.date(),
  sensorA: z.number().positive(),
  sensorB: z.number(),
});

export type Telemetry = z.infer<typeof telemetrySchema>;
