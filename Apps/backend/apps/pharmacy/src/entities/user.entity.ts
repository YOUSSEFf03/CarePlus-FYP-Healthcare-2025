import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Pharmacy } from './pharmacy.entity';
import { Address } from './address.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 50 })
  role: string;

  @Column({ type: 'text', nullable: true })
  profile_picture_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Pharmacy, pharmacy => pharmacy.user)
  pharmacies: Pharmacy[];

  @OneToMany(() => Address, address => address.user)
  addresses: Address[];
}
