import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn
} from 'typeorm';
import { User } from '../users/user.entity';

export enum TransactionType {
  TRANSFER_INTERNAL = 'transfer_internal',
  TRANSFER_EXTERNAL = 'transfer_external',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  SCHEDULED = 'scheduled',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  FLAGGED = 'flagged',
  REJECTED = 'rejected',
  APPROVED = 'approved',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  fromAccountId: string;

  @Column({ nullable: true })
  toAccountId: string;

  @Column({ nullable: true })
  toAccountNumber: string;

  @Column({ nullable: true })
  toBankName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ default: false })
  isFlagged: boolean;

  @Column({ nullable: true })
  flagReason: string;

  @Column({ nullable: true, type: 'datetime' })
  scheduledAt: Date;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true, type: 'datetime' })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
