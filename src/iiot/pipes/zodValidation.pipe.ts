import { PipeTransform, Injectable, Logger } from '@nestjs/common';
import z from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  private readonly logger = new Logger(ZodValidationPipe.name);

  constructor(
    private readonly schema: z.ZodSchema,
    private readonly exceptionFactory: (msg: string) => Error,
  ) {}

  transform(value: any) {
    try {
      this.schema.parse(value);

      return value;
    } catch (error) {
      this.logger.error(error.errors);
      throw this.exceptionFactory('Validation failed');
    }
  }
}
