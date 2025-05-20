import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Pharmacy {
  @PrimaryGeneratedColumn('uuid')
  pharmacy_id: string;

  @OneToOne(() => User, { cascade: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  pharmacy_owner: string;

  @Column()
  pharmacy_name: string;
}
