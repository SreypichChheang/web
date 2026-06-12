import { Controller, Get, Patch, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { MfaMethod } from './user.entity';

@Controller('profile')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getProfile(@Req() req: any) { return this.usersService.getProfile(req.user.id); }

  @Patch()
  updateProfile(@Req() req: any, @Body() body: any) { return this.usersService.updateProfile(req.user.id, body); }

  @Post('change-password')
  changePassword(@Req() req: any, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.usersService.changePassword(req.user.id, body.currentPassword, body.newPassword);
  }

  @Patch('mfa')
  updateMfa(@Req() req: any, @Body() body: { method: MfaMethod }) {
    return this.usersService.updateMfa(req.user.id, body.method);
  }

  @Get('sessions')
  getSessions(@Req() req: any) { return this.usersService.getSessions(req.user.id); }

  @Delete('sessions/:id')
  revokeSession(@Req() req: any, @Param('id') id: string) {
    return this.usersService.revokeSession(req.user.id, id);
  }
}
