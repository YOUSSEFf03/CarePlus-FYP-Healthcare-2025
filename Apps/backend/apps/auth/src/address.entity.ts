import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  user_id: string;

  @Column({ nullable: true })
  pharmacy_branch_id: string;

  @Column({ nullable: true })
  doctor_workplace_id: string;

  @Column({ nullable: true })
  building_name: string;

  @Column({ nullable: true })
  building_number: string;

  @Column({ nullable: true })
  floor_number: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

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

  @ManyToOne('User', 'addresses')
  @JoinColumn({ name: 'user_id' })
  user: any;
}
