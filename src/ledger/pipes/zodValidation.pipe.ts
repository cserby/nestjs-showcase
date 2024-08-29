import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import z from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodSchema) {}

  transform(value: any, _metadata: ArgumentMetadata) {
    const { error } = this.schema.safeParse(value);

    if (error) {
      throw new BadRequestException('Validation failed', error.message);
    }

    return value;
  }
}
