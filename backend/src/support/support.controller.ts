import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SupportService } from './support.service';

@Controller('support/tickets')
@UseGuards(AuthGuard('jwt'))
export class SupportController {
  constructor(private service: SupportService) {}

  @Get()
  getAll(@Req() req: any) { return this.service.getUserTickets(req.user.id); }

  @Post()
  create(@Req() req: any, @Body() body: any) { return this.service.createTicket(req.user.id, body); }
}
