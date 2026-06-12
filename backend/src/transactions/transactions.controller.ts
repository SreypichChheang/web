import { Controller, Get, Post, Body, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(private service: TransactionsService) {}

  @Get()
  getAll(@Req() req: any, @Query() query: any) {
    return this.service.getTransactions(req.user.id, query);
  }

  @Post('transfer')
  transfer(@Req() req: any, @Body() body: any) {
    return this.service.transfer(req.user.id, body);
  }

  @Get('statement')
  async getStatement(@Req() req: any, @Res() res: Response) {
    const csv = await this.service.getStatement(req.user.id);
    res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=statement.csv' });
    res.send(csv);
  }
}
