import { Controller, Get, Param } from '@nestjs/common';
import { LedgerService } from './ledger.service';

@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get(':userId')
  findOne(@Param('userId') id: string) {
    return this.ledgerService.forUserId(id);
  }
}
