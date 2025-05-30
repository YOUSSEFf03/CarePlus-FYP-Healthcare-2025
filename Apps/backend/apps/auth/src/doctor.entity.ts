// This file is deprecated and should be deleted.
// The Doctor entity now lives in the doctor microservice.
// Remove all code below or delete this file.

// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   OneToOne,
//   JoinColumn,
// } from 'typeorm';
// import { User } from './user.entity';

// @Entity()
// export class Doctor {
//   @PrimaryGeneratedColumn('uuid')
//   doctor_id: string;

//   @OneToOne(() => User, { cascade: true })
//   @JoinColumn({ name: 'user_id' })
//   user: User;

//   @Column()
//   specialization: string;

//   @Column()
//   license_number: string;

//   @Column()
//   dr_idCard_url: string;

//   @Column()
//   biography: string;

//   @Column()
//   medical_license_url: string;

//   @Column({ default: 'pending' })
//   verification_status: string;
// }
