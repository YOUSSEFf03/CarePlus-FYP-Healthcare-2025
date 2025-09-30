import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  doctor_id: number;

  @Column()
  user_id: number;

  @Column({ length: 100 })
  specialization: string;

  @Column({ length: 50 })
  license_number: string;

  @Column({ type: 'text', nullable: true })
  biography: string;

  @Column({ nullable: true })
  dr_idCard_url: string;

  @Column({ nullable: true })
  medical_license_url: string;

  @Column({ default: 'pending' })
  verification_status: string;

  @ManyToOne(() => User, user => user.doctors)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}