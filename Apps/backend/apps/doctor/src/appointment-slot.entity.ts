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

@Entity('appointment_slots')
export class AppointmentSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  doctor_id: string;

  @Column()
  workplace_id: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  day_of_week: string; // 'Monday', 'Tuesday', etc.

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ default: true })
  is_available: boolean;

  @Column({ nullable: true })
  appointment_id: string; // FK to appointments when booked

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(() => DoctorWorkplace)
  @JoinColumn({ name: 'workplace_id' })
  workplace: DoctorWorkplace;
}
