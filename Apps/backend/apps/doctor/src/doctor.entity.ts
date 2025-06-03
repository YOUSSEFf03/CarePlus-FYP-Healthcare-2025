import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column()
  specialization: string;

  @Column({ unique: true })
  license_number: string;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verification_status: VerificationStatus;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  biography?: string;

  @Column({ nullable: true })
  dr_idCard_url?: string;

  @Column({ nullable: true })
  medical_license_url?: string;

  @Column({ nullable: true })
  rejection_reason?: string;

  @Column({ type: 'decimal', nullable: true })
  consultation_fee?: number;

  @Column('simple-array', { nullable: true })
  available_days?: string[]; // e.g. ['Monday', 'Tuesday']

  @Column({ nullable: true })
  start_time?: string; // e.g. '09:00'

  @Column({ nullable: true })
  end_time?: string; // e.g. '17:00'

  @Column({ nullable: true })
  total_patients?: number;

  @Column({ type: 'decimal', nullable: true })
  rating?: number;

  @Column({ nullable: true })
  total_reviews?: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
