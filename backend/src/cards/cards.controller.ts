import { Controller, Get, Post, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CardsService } from './cards.service';

@Controller('cards')
@UseGuards(AuthGuard('jwt'))
export class CardsController {
  constructor(private service: CardsService) {}

  @Get()
  getAll(@Req() req: any) { return this.service.getUserCards(req.user.id); }

  @Post()
  request(@Req() req: any, @Body() body: any) { return this.service.requestCard(req.user.id, body); }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.service.updateCard(id, req.user.id, body);
  }
}
