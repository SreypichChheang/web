import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from './support.entity';

@Injectable()
export class SupportService {
  constructor(@InjectRepository(SupportTicket) private repo: Repository<SupportTicket>) {}

  async getUserTickets(userId: string) {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async createTicket(userId: string, dto: any) {
    const ticket = this.repo.create({ ...dto, userId });
    return this.repo.save(ticket);
  }
}
