import { Controller, Get, Post, Patch, Param, Body, Query, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { UserRole } from '../users/user.entity';

function requireAdmin(user: any) {
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.TELLER) throw new ForbiddenException('Admin/Teller only');
}

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private service: AdminService) {}

  @Get('dashboard')
  dashboard(@Req() req: any) { requireAdmin(req.user); return this.service.getDashboard(); }

  @Get('users')
  getUsers(@Req() req: any, @Query('search') search: string, @Query('role') role: UserRole) {
    requireAdmin(req.user); return this.service.getUsers(search, role);
  }

  @Get('users/:id')
  getUserDetail(@Req() req: any, @Param('id') id: string) {
    requireAdmin(req.user); return this.service.getUserDetail(id);
  }

  @Post('users')
  createUser(@Req() req: any, @Body() body: any) {
    requireAdmin(req.user); return this.service.createUser(body);
  }

  @Patch('users/:id')
  updateUser(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    requireAdmin(req.user); return this.service.updateUser(id, body);
  }

  @Post('users/:id/reset-credentials')
  resetCreds(@Req() req: any, @Param('id') id: string) {
    requireAdmin(req.user); return this.service.resetCredentials(id);
  }

  @Post('users/:id/force-logout')
  forceLogout(@Req() req: any, @Param('id') id: string) {
    requireAdmin(req.user); return this.service.forceLogout(id);
  }

  @Get('transactions')
  getTransactions(@Req() req: any, @Query() query: any) {
    requireAdmin(req.user); return this.service.getAllTransactions(query);
  }

  @Patch('transactions/:id')
  updateTransaction(@Req() req: any, @Param('id') id: string, @Body() body: { action: 'approve' | 'reject' }) {
    requireAdmin(req.user); return this.service.updateTransaction(id, body.action, req.user.id);
  }

  @Get('sessions')
  getSessions(@Req() req: any) { requireAdmin(req.user); return this.service.getAllSessions(); }

  @Get('audit-logs')
  getAuditLogs(@Req() req: any, @Query('search') search: string) {
    requireAdmin(req.user); return this.service.getAuditLogs(search);
  }

  @Get('support/tickets')
  getTickets(@Req() req: any) { requireAdmin(req.user); return this.service.getTickets(); }

  @Patch('support/tickets/:id')
  updateTicket(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    requireAdmin(req.user); return this.service.updateTicket(id, body);
  }
}
