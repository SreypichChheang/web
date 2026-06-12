import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, MfaMethod } from './user.entity';
import { Session } from '../auth/session.entity';
import { AuditLog } from '../admin/audit-log.entity';
import { Notification } from '../notifications/notification.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Session) private sessionsRepo: Repository<Session>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const { password, mfaOtp, mfaSecret, resetToken, ...safe } = user;
    return safe;
  }

  async updateProfile(userId: string, dto: Partial<User>) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const allowed = ['firstName', 'lastName', 'phone', 'address'];
    allowed.forEach(k => { if (dto[k] !== undefined) user[k] = dto[k]; });
    await this.usersRepo.save(user);
    await this.auditRepo.save(this.auditRepo.create({ action: 'PROFILE_UPDATE', userId, details: 'Profile updated' }));
    const { password, mfaOtp, mfaSecret, resetToken, ...safe } = user;
    return safe;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new BadRequestException('Current password is incorrect');
    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersRepo.save(user);
    await this.auditRepo.save(this.auditRepo.create({ action: 'PASSWORD_CHANGE', userId, details: 'Password changed' }));
    return { message: 'Password changed successfully' };
  }

  async updateMfa(userId: string, method: MfaMethod) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.mfaMethod = method;
    await this.usersRepo.save(user);
    return { message: `MFA updated to ${method}` };
  }

  async getSessions(userId: string) {
    return this.sessionsRepo.find({ where: { userId, isActive: true }, order: { createdAt: 'DESC' } });
  }

  async revokeSession(userId: string, sessionId: string) {
    await this.sessionsRepo.update({ id: sessionId, userId }, { isActive: false });
    return { message: 'Session revoked' };
  }
}
