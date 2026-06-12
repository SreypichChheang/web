import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany
} from 'typeorm';

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  TELLER = 'teller',
}

export enum MfaMethod {
  NONE = 'none',
  EMAIL = 'email',
  SMS = 'sms',
  AUTHENTICATOR = 'authenticator',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'enum', enum: MfaMethod, default: MfaMethod.NONE })
  mfaMethod: MfaMethod;

  @Column({ nullable: true })
  mfaSecret: string;

  @Column({ nullable: true })
  mfaOtp: string;

  @Column({ nullable: true, type: 'datetime' })
  mfaOtpExpiry: Date;

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true, type: 'datetime' })
  resetTokenExpiry: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
