import z from 'zod';

export const requestPayoutSchema = z.object({
  userId: z.string().min(3).max(30),
  amount: z.number().positive(),
});

export type RequestPayout = z.infer<typeof requestPayoutSchema>;
