import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('doctor_workplace_assistants')
export class DoctorWorkplaceAssistant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  doctorWorkplaceId: string; // FK to doctor_workplaces

  @Column()
  assistantId: string; // FK to users table (assistant user)

  @Column()
  inviteId: string; // FK to assistant_invites

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: string;

  @CreateDateColumn()
  assigned_at: Date;
}
