import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationType } from './notification-log.entity';

@Entity('user_preferences')
export class UserPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column({ default: true })
  emailEnabled: boolean;

  @Column({ default: true })
  whatsappEnabled: boolean;

  @Column({ default: true })
  smsEnabled: boolean;

  @Column({ default: true })
  pushEnabled: boolean;

  @Column('json', { nullable: true })
  notificationTypes: NotificationType[]; // Which notifications user wants to receive

  @Column({ nullable: true })
  preferredLanguage: string;

  @Column({ nullable: true })
  timezone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
