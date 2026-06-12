import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { User, UserRole, MfaMethod } from '../users/user.entity';
import { Session } from './session.entity';
import { AuditLog } from '../admin/audit-log.entity';
import { Notification, NotificationType } from '../notifications/notification.entity';
import { Account, AccountType, AccountStatus } from '../accounts/account.entity';
import { Card, CardType, CardStatus, CardNetwork } from '../cards/card.entity';
import { Transaction, TransactionType, TransactionStatus } from '../transactions/transaction.entity';
import { SupportTicket, TicketCategory, TicketPriority, TicketStatus } from '../support/support.entity';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateAccountNumber(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Session) private sessionsRepo: Repository<Session>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(Account) private accountsRepo: Repository<Account>,
    @InjectRepository(Card) private cardsRepo: Repository<Card>,
    @InjectRepository(Transaction) private txnRepo: Repository<Transaction>,
    @InjectRepository(SupportTicket) private ticketsRepo: Repository<SupportTicket>,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.seedDatabase();
  }

  async seedDatabase() {
    const count = await this.usersRepo.count();
    if (count > 0) return;

    // Create users
    const users = [
      {
        username: 'john.doe', email: 'john.doe@email.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'John', lastName: 'Doe', phone: '+1234567890',
        address: '123 Main St, New York, NY 10001',
        role: UserRole.CUSTOMER, mfaMethod: MfaMethod.EMAIL,
      },
      {
        username: 'jane.smith', email: 'jane.smith@email.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Jane', lastName: 'Smith', phone: '+0987654321',
        address: '456 Oak Ave, Los Angeles, CA 90001',
        role: UserRole.CUSTOMER, mfaMethod: MfaMethod.NONE,
      },
      {
        username: 'admin', email: 'admin@bank.com',
        password: await bcrypt.hash('admin123', 10),
        firstName: 'System', lastName: 'Admin',
        role: UserRole.ADMIN, mfaMethod: MfaMethod.AUTHENTICATOR,
      },
      {
        username: 'teller01', email: 'teller01@bank.com',
        password: await bcrypt.hash('teller123', 10),
        firstName: 'Alice', lastName: 'Teller', phone: '+5555555555',
        role: UserRole.TELLER, mfaMethod: MfaMethod.SMS,
      },
    ];

    const savedUsers: User[] = [];
    for (const u of users) {
      const user = this.usersRepo.create(u);
      savedUsers.push(await this.usersRepo.save(user));
    }

    const john = savedUsers[0];
    const jane = savedUsers[1];

    // Create accounts
    const accounts = [
      { accountNumber: generateAccountNumber(), type: AccountType.SAVINGS, balance: 15420.50, interestRate: 2.5, currency: 'USD', userId: john.id },
      { accountNumber: generateAccountNumber(), type: AccountType.CURRENT, balance: 8750.25, interestRate: 0, currency: 'USD', userId: john.id },
      { accountNumber: generateAccountNumber(), type: AccountType.LOAN, balance: -25000, interestRate: 5.5, currency: 'USD', userId: john.id },
      { accountNumber: generateAccountNumber(), type: AccountType.SAVINGS, balance: 32100.75, interestRate: 2.5, currency: 'USD', userId: jane.id },
      { accountNumber: generateAccountNumber(), type: AccountType.CURRENT, balance: 5600.00, interestRate: 0, currency: 'USD', userId: jane.id },
    ];
    const savedAccounts: Account[] = [];
    for (const a of accounts) {
      const acc = this.accountsRepo.create(a);
      savedAccounts.push(await this.accountsRepo.save(acc));
    }

    // Create cards
    const cards = [
      {
        cardNumber: '**** **** **** 4521', cardHolderName: 'JOHN DOE',
        expiryMonth: '12', expiryYear: '2027', cvv: '***',
        type: CardType.DEBIT, network: CardNetwork.VISA,
        dailyLimit: 5000, userId: john.id, accountId: savedAccounts[0].id,
      },
      {
        cardNumber: '**** **** **** 8832', cardHolderName: 'JOHN DOE',
        expiryMonth: '06', expiryYear: '2026', cvv: '***',
        type: CardType.CREDIT, network: CardNetwork.MASTERCARD,
        dailyLimit: 10000, userId: john.id, accountId: savedAccounts[1].id,
      },
    ];
    for (const c of cards) {
      await this.cardsRepo.save(this.cardsRepo.create(c));
    }

    // Create transactions
    const txns = [
      { type: TransactionType.TRANSFER_INTERNAL, amount: 500, fromAccountId: savedAccounts[1].id, toAccountId: savedAccounts[0].id, description: 'Savings top-up', status: TransactionStatus.COMPLETED, currency: 'USD', userId: john.id },
      { type: TransactionType.TRANSFER_EXTERNAL, amount: 1500, fromAccountId: savedAccounts[0].id, toAccountNumber: '9876543210', toBankName: 'Chase Bank', description: 'Rent payment', status: TransactionStatus.COMPLETED, currency: 'USD', userId: john.id },
      { type: TransactionType.TRANSFER_EXTERNAL, amount: 12000, fromAccountId: savedAccounts[1].id, toAccountNumber: '1234509876', toBankName: 'Wells Fargo', description: 'Property deposit', status: TransactionStatus.FLAGGED, isFlagged: true, flagReason: 'Amount exceeds $10,000 threshold', currency: 'USD', userId: john.id },
      { type: TransactionType.DEPOSIT, amount: 3000, toAccountId: savedAccounts[0].id, description: 'Salary deposit', status: TransactionStatus.COMPLETED, currency: 'USD', userId: john.id },
      { type: TransactionType.WITHDRAWAL, amount: 200, fromAccountId: savedAccounts[0].id, description: 'ATM withdrawal', status: TransactionStatus.COMPLETED, currency: 'USD', userId: john.id },
    ];
    for (const t of txns) {
      await this.txnRepo.save(this.txnRepo.create(t));
    }

    // Create notifications
    const notifs = [
      { title: 'Transfer Completed', message: 'Your transfer of $500 to savings was successful', type: NotificationType.TRANSFER, userId: john.id },
      { title: 'New Login', message: 'New login detected from Chrome on Windows', type: NotificationType.LOGIN, userId: john.id },
      { title: 'Security Alert', message: 'Large transfer of $12,000 has been flagged for review', type: NotificationType.SECURITY, isRead: false, userId: john.id },
      { title: 'Low Balance Alert', message: 'Your current account balance is below $1,000', type: NotificationType.ALERT, userId: john.id },
    ];
    for (const n of notifs) {
      await this.notifRepo.save(this.notifRepo.create(n));
    }

    // Create support ticket
    await this.ticketsRepo.save(this.ticketsRepo.create({
      subject: 'Cannot access my account',
      description: 'I have been locked out of my account after multiple failed attempts',
      category: TicketCategory.ACCOUNT,
      priority: TicketPriority.HIGH,
      status: TicketStatus.OPEN,
      userId: john.id,
    }));

    console.log('✅ Database seeded successfully');
  }

  async login(username: string, password: string, req?: any) {
    const user = await this.usersRepo.findOne({
      where: [{ username }, { email: username }],
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account is disabled');
    if (user.isLocked) throw new UnauthorizedException('Account is locked after too many failed attempts');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.isLocked = true;
        await this.usersRepo.save(user);
        throw new UnauthorizedException('Account locked after 5 failed attempts');
      }
      await this.usersRepo.save(user);
      throw new UnauthorizedException(`Invalid credentials. ${5 - user.failedLoginAttempts} attempts remaining`);
    }

    user.failedLoginAttempts = 0;
    await this.usersRepo.save(user);

    if (user.mfaMethod !== MfaMethod.NONE) {
      const otp = generateOtp();
      const expiry = new Date(Date.now() + 10 * 60 * 1000);
      user.mfaOtp = otp;
      user.mfaOtpExpiry = expiry;
      await this.usersRepo.save(user);

      return {
        requiresMfa: true,
        mfaMethod: user.mfaMethod,
        userId: user.id,
        // Demo: show OTP in response
        demoOtp: otp,
        message: `OTP sent via ${user.mfaMethod}`,
      };
    }

    return this.generateTokenAndSession(user, req);
  }

  async verifyMfa(userId: string, otp: string, req?: any) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.mfaMethod === MfaMethod.AUTHENTICATOR && user.mfaSecret) {
      const isValid = speakeasy.totp.verify({
        secret: user.mfaSecret, encoding: 'base32', token: otp, window: 1,
      });
      if (!isValid) throw new UnauthorizedException('Invalid authenticator code');
    } else {
      if (!user.mfaOtp || user.mfaOtp !== otp) throw new UnauthorizedException('Invalid OTP');
      if (new Date() > user.mfaOtpExpiry) throw new UnauthorizedException('OTP has expired');
      user.mfaOtp = null;
      user.mfaOtpExpiry = null;
      await this.usersRepo.save(user);
    }

    return this.generateTokenAndSession(user, req);
  }

  private async generateTokenAndSession(user: User, req?: any) {
    const payload = { sub: user.id, username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);

    const session = this.sessionsRepo.create({
      token, userId: user.id,
      ipAddress: req?.ip || '127.0.0.1',
      userAgent: req?.headers?.['user-agent'] || 'Unknown',
      device: this.extractDevice(req?.headers?.['user-agent']),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await this.sessionsRepo.save(session);

    await this.auditRepo.save(this.auditRepo.create({
      action: 'LOGIN', userId: user.id,
      ipAddress: req?.ip || '127.0.0.1',
      details: `User logged in successfully`,
    }));

    await this.notifRepo.save(this.notifRepo.create({
      title: 'New Login',
      message: `New login from ${req?.ip || '127.0.0.1'}`,
      type: NotificationType.LOGIN,
      userId: user.id,
    }));

    const { password, mfaOtp, mfaSecret, resetToken, ...safeUser } = user;
    return { token, user: safeUser };
  }

  async logout(token: string, userId: string) {
    await this.sessionsRepo.update({ token, userId }, { isActive: false });
    await this.auditRepo.save(this.auditRepo.create({
      action: 'LOGOUT', userId,
      details: 'User logged out',
    }));
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Email not found');

    const token = generateOtp();
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await this.usersRepo.save(user);

    return { message: 'Reset code sent', demoToken: token };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersRepo.findOne({ where: { resetToken: token } });
    if (!user || new Date() > user.resetTokenExpiry) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await this.usersRepo.save(user);

    return { message: 'Password reset successfully' };
  }

  async resendOtp(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const otp = generateOtp();
    user.mfaOtp = otp;
    user.mfaOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await this.usersRepo.save(user);

    return { message: 'OTP resent', demoOtp: otp };
  }

  async getProfile(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    const { password, mfaOtp, mfaSecret, resetToken, ...safe } = user;
    return safe;
  }

  private extractDevice(ua: string): string {
    if (!ua) return 'Unknown';
    if (ua.includes('Mobile')) return 'Mobile';
    if (ua.includes('Chrome')) return 'Chrome Desktop';
    if (ua.includes('Firefox')) return 'Firefox Desktop';
    return 'Desktop';
  }
}
