import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  PHARMACY = 'pharmacy',
  ADMIN = 'admin',
  ASSISTANT = 'assistant',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role: UserRole;

  @Column()
  phone: string;

  @Column({ nullable: true })
  profile_picture_url: string;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ nullable: true })
  otp_code: string;

  @Column({ type: 'timestamp', nullable: true })
  otp_expiry: Date;

  @Column({ nullable: true })
  refresh_token: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
