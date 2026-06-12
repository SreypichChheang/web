import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../users/user.entity';
import { Session } from '../auth/session.entity';
import { Transaction, TransactionStatus } from '../transactions/transaction.entity';
import { Account } from '../accounts/account.entity';
import { AuditLog } from './audit-log.entity';
import { SupportTicket } from '../support/support.entity';
import { Notification, NotificationType } from '../notifications/notification.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Session) private sessionsRepo: Repository<Session>,
    @InjectRepository(Transaction) private txnRepo: Repository<Transaction>,
    @InjectRepository(Account) private accountsRepo: Repository<Account>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
    @InjectRepository(SupportTicket) private ticketsRepo: Repository<SupportTicket>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  async getDashboard() {
    const totalUsers = await this.usersRepo.count();
    const activeUsers = await this.usersRepo.count({ where: { isActive: true } });
    const lockedUsers = await this.usersRepo.count({ where: { isLocked: true } });
    const totalTransactions = await this.txnRepo.count();
    const flaggedTransactions = await this.txnRepo.count({ where: { isFlagged: true } });
    const activeSessions = await this.sessionsRepo.count({ where: { isActive: true } });
    const openTickets = await this.ticketsRepo.count({ where: { status: 'open' as any } });

    const recentLogs = await this.auditRepo.find({ order: { createdAt: 'DESC' }, take: 5 });

    return {
      stats: { totalUsers, activeUsers, lockedUsers, totalTransactions, flaggedTransactions, activeSessions, openTickets },
      recentLogs,
    };
  }

  async getUsers(search?: string, role?: UserRole) {
    const query = this.usersRepo.createQueryBuilder('u').orderBy('u.createdAt', 'DESC');
    if (search) query.where('u.username LIKE :s OR u.email LIKE :s OR u.firstName LIKE :s', { s: `%${search}%` });
    if (role) query.andWhere('u.role = :role', { role });
    const users = await query.getMany();
    return users.map(u => { const { password, mfaOtp, mfaSecret, resetToken, ...safe } = u; return safe; });
  }

  async getUserDetail(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const accounts = await this.accountsRepo.find({ where: { userId: id } });
    const transactions = await this.txnRepo.find({ where: { userId: id }, order: { createdAt: 'DESC' }, take: 10 });
    const { password, mfaOtp, mfaSecret, resetToken, ...safe } = user;
    return { user: safe, accounts, transactions };
  }

  async updateUser(id: string, dto: any) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const allowed = ['isActive', 'isLocked', 'role', 'firstName', 'lastName'];
    allowed.forEach(k => { if (dto[k] !== undefined) user[k] = dto[k]; });
    if (dto.isLocked === false) user.failedLoginAttempts = 0;
    await this.usersRepo.save(user);
    await this.auditRepo.save(this.auditRepo.create({ action: 'ADMIN_USER_UPDATE', userId: id, details: JSON.stringify(dto) }));
    const { password, mfaOtp, mfaSecret, resetToken, ...safe } = user;
    return safe;
  }

  async createUser(dto: any) {
    const existing = await this.usersRepo.findOne({ where: [{ username: dto.username }, { email: dto.email }] });
    if (existing) throw new ForbiddenException('Username or email already exists');
    const user = this.usersRepo.create({ ...dto, password: await bcrypt.hash(dto.password, 10) });
    const saved = await this.usersRepo.save(user);
    const { password, ...safe } = saved;
    return safe;
  }

  async resetCredentials(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const newPassword = Math.random().toString(36).slice(2, 10);
    user.password = await bcrypt.hash(newPassword, 10);
    user.isLocked = false;
    user.failedLoginAttempts = 0;
    await this.usersRepo.save(user);
    return { message: 'Credentials reset', temporaryPassword: newPassword };
  }

  async forceLogout(id: string) {
    await this.sessionsRepo.update({ userId: id }, { isActive: false });
    return { message: 'All sessions terminated' };
  }

  async getAllTransactions(filters?: any) {
    const query = this.txnRepo.createQueryBuilder('t').orderBy('t.createdAt', 'DESC');
    if (filters?.isFlagged === 'true') query.where('t.isFlagged = true');
    if (filters?.status) query.andWhere('t.status = :status', { status: filters.status });
    return query.getMany();
  }

  async updateTransaction(id: string, action: 'approve' | 'reject', adminId: string) {
    const txn = await this.txnRepo.findOne({ where: { id } });
    if (!txn) throw new NotFoundException('Transaction not found');
    txn.status = action === 'approve' ? TransactionStatus.APPROVED : TransactionStatus.REJECTED;
    txn.approvedBy = adminId;
    txn.approvedAt = new Date();
    txn.isFlagged = false;
    await this.txnRepo.save(txn);
    await this.notifRepo.save(this.notifRepo.create({
      title: `Transfer ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      message: `Your transfer of $${txn.amount} has been ${action}d`,
      type: NotificationType.SECURITY, userId: txn.userId,
    }));
    return txn;
  }

  async getAllSessions() {
    return this.sessionsRepo.find({ where: { isActive: true }, order: { createdAt: 'DESC' } });
  }

  async getAuditLogs(search?: string) {
    const query = this.auditRepo.createQueryBuilder('a').orderBy('a.createdAt', 'DESC').take(100);
    if (search) query.where('a.action LIKE :s OR a.details LIKE :s', { s: `%${search}%` });
    return query.getMany();
  }

  async getTickets() {
    return this.ticketsRepo.find({ order: { createdAt: 'DESC' } });
  }

  async updateTicket(id: string, dto: any) {
    const ticket = await this.ticketsRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    Object.assign(ticket, dto);
    return this.ticketsRepo.save(ticket);
  }
}
