import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { DoctorWorkplace } from './doctor-workplace.entity';

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('assistant_invites')
export class AssistantInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  doctorId: string; // FK to doctors table

  @Column()
  assistantId: string; // FK to users table (assistant user)

  @Column()
  workplaceId: string; // ← ADD: FK to doctor_workplaces

  @Column({
    type: 'enum',
    enum: InviteStatus,
    default: InviteStatus.PENDING,
  })
  status: InviteStatus;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ nullable: true })
  message: string; // Optional message from doctor

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @ManyToOne(() => DoctorWorkplace)
  @JoinColumn({ name: 'workplaceId' })
  workplace: DoctorWorkplace;
}
