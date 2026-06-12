import { Controller, Post, Get, Body, Req, UseGuards, Headers } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: { username: string; password: string }, @Req() req: any) {
    return this.authService.login(body.username, body.password, req);
  }

  @Post('mfa/verify')
  verifyMfa(@Body() body: { userId: string; otp: string }, @Req() req: any) {
    return this.authService.verifyMfa(body.userId, body.otp, req);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  logout(@Req() req: any, @Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '');
    return this.authService.logout(token, req.user.id);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @Post('resend-otp')
  resendOtp(@Body() body: { userId: string }) {
    return this.authService.resendOtp(body.userId);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }
}
