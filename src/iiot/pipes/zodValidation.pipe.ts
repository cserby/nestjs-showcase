import { PipeTransform, Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import z from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  private readonly logger = new Logger(ZodValidationPipe.name);

  constructor(private readonly schema: z.ZodSchema) {}

  transform(value: any) {
    try {
      this.schema.parse(value);

      return value;
    } catch (error) {
      this.logger.error(error.errors);
      throw new WsException('Validation failed');
    }
  }
}
