import { Controller, Get, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get()
  getAll(@Req() req: any) { return this.service.getAll(req.user.id); }

  @Post('read')
  markAll(@Req() req: any) { return this.service.markRead(req.user.id); }

  @Post('read/:id')
  markOne(@Req() req: any, @Param('id') id: string) { return this.service.markRead(req.user.id, id); }
}
