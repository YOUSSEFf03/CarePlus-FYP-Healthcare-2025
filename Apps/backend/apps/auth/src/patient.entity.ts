import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  patient_id: string;

  @OneToOne(() => User, { cascade: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  date_of_birth: string;

  @Column()
  gender: string;

  @Column({ nullable: true })
  medical_history: string;
}
