import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card, CardType, CardStatus, CardNetwork } from './card.entity';

@Injectable()
export class CardsService {
  constructor(@InjectRepository(Card) private repo: Repository<Card>) {}

  async getUserCards(userId: string) {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async requestCard(userId: string, dto: any) {
    const card = this.repo.create({
      userId,
      cardNumber: `**** **** **** ${Math.floor(1000 + Math.random() * 9000)}`,
      cardHolderName: dto.cardHolderName?.toUpperCase(),
      expiryMonth: '12',
      expiryYear: '2028',
      cvv: '***',
      type: dto.type || CardType.DEBIT,
      network: dto.network || CardNetwork.VISA,
      dailyLimit: dto.dailyLimit || 3000,
      accountId: dto.accountId,
    });
    return this.repo.save(card);
  }

  async updateCard(id: string, userId: string, dto: any) {
    const card = await this.repo.findOne({ where: { id, userId } });
    if (!card) throw new NotFoundException('Card not found');

    if (dto.action === 'freeze') {
      if (card.status === CardStatus.BLOCKED) throw new BadRequestException('Card is permanently blocked');
      card.status = card.status === CardStatus.FROZEN ? CardStatus.ACTIVE : CardStatus.FROZEN;
    } else if (dto.action === 'block') {
      card.status = CardStatus.BLOCKED;
    } else if (dto.action === 'changePin') {
      // PIN stored hashed in real app; demo just acknowledges
    } else if (dto.dailyLimit) {
      card.dailyLimit = dto.dailyLimit;
    }

    return this.repo.save(card);
  }
}
