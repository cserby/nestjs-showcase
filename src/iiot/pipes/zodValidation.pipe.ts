import { PipeTransform, Injectable } from '@nestjs/common';
import z from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodSchema) {}

  transform(value: any) {
    this.schema.parse(value);

    return value;
  }
}
