import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Session } from '../auth/session.entity';
import { AuditLog } from '../admin/audit-log.entity';
import { Account } from '../accounts/account.entity';
import { Notification } from '../notifications/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Session, AuditLog, Account, Notification])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
