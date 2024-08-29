import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { ZodValidationPipe } from './pipes/zodValidation.pipe';
import { RequestPayout, requestPayoutSchema } from './dtos/requestPayout.dto';

@Controller('payouts')
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Get()
  async findAll() {
    return await this.payoutsService.getAll();
  }

  @Post()
  @UsePipes(new ZodValidationPipe(requestPayoutSchema))
  async requestPayout(@Body() requestPayout: RequestPayout) {
    return await this.payoutsService.requestPayout(requestPayout);
  }
}
