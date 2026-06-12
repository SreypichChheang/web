import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, AccountType, AccountStatus } from './account.entity';

function generateAccountNumber(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

@Injectable()
export class AccountsService {
  constructor(@InjectRepository(Account) private repo: Repository<Account>) {}

  async getUserAccounts(userId: string) {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async getAccount(id: string, userId: string) {
    const acc = await this.repo.findOne({ where: { id, userId } });
    if (!acc) throw new NotFoundException('Account not found');
    return acc;
  }

  async openAccount(userId: string, type: AccountType, currency = 'USD') {
    if (type === AccountType.LOAN) throw new BadRequestException('Loan accounts must be opened by a teller');
    const acc = this.repo.create({
      accountNumber: generateAccountNumber(), type, userId, currency,
      interestRate: type === AccountType.SAVINGS ? 2.5 : 0,
    });
    return this.repo.save(acc);
  }

  async getTotalBalance(userId: string): Promise<number> {
    const accounts = await this.getUserAccounts(userId);
    return accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  }
}
