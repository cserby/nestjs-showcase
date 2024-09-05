import { z } from 'zod';

export const deviceConfigSchema = z.object({
  sensorSettings: z.object({
    sensorA: z.object({
      enabled: z.boolean(),
      threshold: z.number().int(),
    }),
    sensorB: z.object({
      enabled: z.boolean(),
      threshold: z.number().int(),
    }),
  }),
  softwareVersion: z.string(),
});

export type DeviceConfig = z.infer<typeof deviceConfigSchema>;
