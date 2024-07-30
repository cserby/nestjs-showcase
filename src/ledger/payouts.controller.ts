import { Controller, Get } from '@nestjs/common';
import { PayoutsService } from './payouts.service';

@Controller('payouts')
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Get()
  async findAll() {
    return await this.payoutsService.getAll();
  }
}
