import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { PharmacyBranch } from './pharmacy-branch.entity';
import { Delivery } from './delivery.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  address_id: number;

  @Column({ nullable: true })
  user_id: number;

  @Column({ nullable: true })
  pharmacy_branch_id: number;

  @Column({ length: 100, nullable: true })
  building_name: string;

  @Column({ length: 50, nullable: true })
  building_number: string;

  @Column({ length: 20, nullable: true })
  floor_number: string;

  @Column({ length: 150 })
  street: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  state: string;

  @Column({ length: 100 })
  country: string;

  @Column({ length: 20, nullable: true })
  zipcode: string;

  @Column({ type: 'text', nullable: true })
  area_description: string;

  @Column({ type: 'text', nullable: true })
  maps_link: string;

  @ManyToOne(() => User, user => user.addresses)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => PharmacyBranch, branch => branch.addresses)
  @JoinColumn({ name: 'pharmacy_branch_id' })
  pharmacy_branch: PharmacyBranch;

  @OneToMany(() => Delivery, delivery => delivery.address)
  deliveries: Delivery[];
}


