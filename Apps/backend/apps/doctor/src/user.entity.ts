import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  PHARMACY = 'pharmacy',
}

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
  profile_picture_url?: string;

  @Column({ nullable: true })
  date_of_birth?: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ nullable: true })
  medical_history?: string;

  @Column({ nullable: true })
  specialization?: string;

  @Column({ nullable: true })
  license_number?: string;

  @Column({ nullable: true })
  dr_idCard_url?: string;

  @Column({ nullable: true })
  biography?: string;

  @Column({ nullable: true })
  medical_license_url?: string;

  @Column({ default: 'pending' })
  verification_status?: string;

  @Column({ nullable: true })
  pharmacy_owner?: string;

  @Column({ nullable: true })
  pharmacy_name?: string;

  @Column({ nullable: true })
  otp_code?: string;

  @Column({ type: 'timestamptz', nullable: true })
  otp_expiry?: Date;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ nullable: true })
  refresh_token?: string;
}
