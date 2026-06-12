import { Controller, Get, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountsService } from './accounts.service';
import { AccountType } from './account.entity';

@Controller('accounts')
@UseGuards(AuthGuard('jwt'))
export class AccountsController {
  constructor(private service: AccountsService) {}

  @Get()
  getAll(@Req() req: any) { return this.service.getUserAccounts(req.user.id); }

  @Get(':id')
  getOne(@Req() req: any, @Param('id') id: string) { return this.service.getAccount(id, req.user.id); }

  @Post()
  open(@Req() req: any, @Body() body: { type: AccountType; currency?: string }) {
    return this.service.openAccount(req.user.id, body.type, body.currency);
  }
}
