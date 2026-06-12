import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { User } from '../users/user.entity';

export enum CardType { DEBIT = 'debit', CREDIT = 'credit' }
export enum CardStatus { ACTIVE = 'active', FROZEN = 'frozen', BLOCKED = 'blocked', EXPIRED = 'expired' }
export enum CardNetwork { VISA = 'visa', MASTERCARD = 'mastercard' }

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cardNumber: string;

  @Column()
  cardHolderName: string;

  @Column()
  expiryMonth: string;

  @Column()
  expiryYear: string;

  @Column()
  cvv: string;

  @Column({ type: 'enum', enum: CardType })
  type: CardType;

  @Column({ type: 'enum', enum: CardStatus, default: CardStatus.ACTIVE })
  status: CardStatus;

  @Column({ type: 'enum', enum: CardNetwork, default: CardNetwork.VISA })
  network: CardNetwork;

  @Column({ nullable: true })
  accountId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  dailyLimit: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
