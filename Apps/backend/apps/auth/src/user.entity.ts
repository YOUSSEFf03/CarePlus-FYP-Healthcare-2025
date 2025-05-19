import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Patient } from './patient.entity'; // we'll create this next

export type UserRole = 'patient' | 'doctor' | 'admin';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  role: UserRole;

  @Column()
  phone: string;

  @Column({ nullable: true })
  profile_picture_url: string;

  @OneToOne(() => Patient, (patient) => patient.user)
  patient?: Patient;

  @Column({ nullable: true })
  refresh_token?: string;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ nullable: true })
  otp_code: string;

  @Column({ nullable: true })
  otp_expiry: Date;
}
