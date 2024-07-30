import { Controller, Get, Param } from '@nestjs/common';
import { LedgerService } from './ledger.service';

@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get(':userId')
  async findOne(@Param('userId') id: string) {
    return await this.ledgerService.forUserId(id);
  }
}
