import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/user.entity';
import { Session } from '../auth/session.entity';
import { Transaction } from '../transactions/transaction.entity';
import { Account } from '../accounts/account.entity';
import { SupportTicket } from '../support/support.entity';
import { Notification } from '../notifications/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, User, Session, Transaction, Account, SupportTicket, Notification])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
