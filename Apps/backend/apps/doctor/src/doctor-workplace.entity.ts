import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { Address } from './address.entity';
import { AppointmentSlot } from './appointment-slot.entity';

export enum WorkplaceType {
  CLINIC = 'clinic',
  HOSPITAL = 'hospital',
  PRIVATE_PRACTICE = 'private_practice',
  MEDICAL_CENTER = 'medical_center',
  HOME_VISITS = 'home_visits',
}

@Entity('doctor_workplaces')
export class DoctorWorkplace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  doctorId: string; // FK to doctors table

  @Column()
  workplace_name: string;

  @Column({
    type: 'enum',
    enum: WorkplaceType,
  })
  workplace_type: WorkplaceType;

  @Column({ default: false })
  is_primary: boolean;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  email: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  website: string;

  @Column({ default: true })
  is_active: boolean;

  // Working hours
  @Column('json', { nullable: true })
  working_hours: any; // {"monday": {"start": "09:00", "end": "17:00"}, ...}

  @Column({ nullable: true })
  consultation_fee: number;

  @Column('json', { nullable: true })
  services_offered: string[]; // ["consultation", "surgery", "checkup"]

  @Column('json', { nullable: true })
  insurance_accepted: string[]; // List of insurance providers

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @OneToMany(() => Address, (address) => address.doctor_workplace_id)
  addresses: Address[];

  @OneToMany(() => AppointmentSlot, (slot) => slot.workplace_id)
  appointment_slots: AppointmentSlot[];
}
