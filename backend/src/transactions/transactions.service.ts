import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from './transaction.entity';
import { Account } from '../accounts/account.entity';
import { Notification, NotificationType } from '../notifications/notification.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private txnRepo: Repository<Transaction>,
    @InjectRepository(Account) private accRepo: Repository<Account>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  async getTransactions(userId: string, filters?: any) {
    const query = this.txnRepo.createQueryBuilder('t')
      .where('t.userId = :userId', { userId })
      .orderBy('t.createdAt', 'DESC');

    if (filters?.type) query.andWhere('t.type = :type', { type: filters.type });
    if (filters?.status) query.andWhere('t.status = :status', { status: filters.status });
    if (filters?.startDate) query.andWhere('t.createdAt >= :startDate', { startDate: filters.startDate });
    if (filters?.endDate) query.andWhere('t.createdAt <= :endDate', { endDate: filters.endDate });

    return query.getMany();
  }

  async transfer(userId: string, dto: any) {
    const fromAccount = await this.accRepo.findOne({ where: { id: dto.fromAccountId, userId } });
    if (!fromAccount) throw new NotFoundException('Source account not found');
    if (Number(fromAccount.balance) < dto.amount) throw new BadRequestException('Insufficient funds');

    const isFlagged = dto.amount > 10000;
    const status = isFlagged ? TransactionStatus.FLAGGED : TransactionStatus.COMPLETED;

    if (!isFlagged) {
      fromAccount.balance = Number(fromAccount.balance) - dto.amount;
      await this.accRepo.save(fromAccount);

      if (dto.toAccountId) {
        const toAccount = await this.accRepo.findOne({ where: { id: dto.toAccountId } });
        if (toAccount) {
          toAccount.balance = Number(toAccount.balance) + dto.amount;
          await this.accRepo.save(toAccount);
        }
      }
    }

    const txn = await this.txnRepo.save(this.txnRepo.create({
      userId, amount: dto.amount,
      type: dto.toAccountId ? TransactionType.TRANSFER_INTERNAL : TransactionType.TRANSFER_EXTERNAL,
      fromAccountId: dto.fromAccountId,
      toAccountId: dto.toAccountId,
      toAccountNumber: dto.toAccountNumber,
      toBankName: dto.toBankName,
      description: dto.description,
      currency: dto.currency || 'USD',
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      status, isFlagged,
      flagReason: isFlagged ? 'Amount exceeds $10,000 threshold' : null,
    }));

    if (isFlagged) {
      await this.notifRepo.save(this.notifRepo.create({
        title: 'Transfer Flagged',
        message: `Your transfer of $${dto.amount} has been flagged for review`,
        type: NotificationType.SECURITY, userId,
      }));
    } else {
      await this.notifRepo.save(this.notifRepo.create({
        title: 'Transfer Successful',
        message: `$${dto.amount} transferred successfully`,
        type: NotificationType.TRANSFER, userId,
      }));
    }

    return txn;
  }

  async getStatement(userId: string): Promise<string> {
    const txns = await this.getTransactions(userId);
    const header = 'Date,Type,Amount,Status,Description\n';
    const rows = txns.map(t =>
      `${t.createdAt.toISOString()},${t.type},${t.amount},${t.status},"${t.description || ''}"`
    ).join('\n');
    return header + rows;
  }
}
