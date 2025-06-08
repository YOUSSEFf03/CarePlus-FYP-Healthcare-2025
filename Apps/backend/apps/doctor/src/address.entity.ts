import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  user_id: string; // FK to users (for patient addresses)

  @Column({ nullable: true })
  pharmacy_branch_id: string; // FK to pharmacy branches

  @Column({ nullable: true })
  doctor_workplace_id: string; // FK to doctor workplaces

  @Column({ nullable: true })
  building_name: string;

  @Column({ nullable: true })
  building_number: string;

  @Column({ nullable: true })
  floor_number: string;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  zipcode: string;

  @Column('text', { nullable: true })
  area_description: string;

  @Column({ nullable: true })
  maps_link: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
