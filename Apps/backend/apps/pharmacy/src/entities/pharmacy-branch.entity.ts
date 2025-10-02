import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Pharmacy } from './pharmacy.entity';
import { Address } from './address.entity';
import { PharmacyBranchStock } from './pharmacy-branch-stock.entity';
import { Reservation } from './reservation.entity';
import { Order } from './order.entity';

@Entity('pharmacies_branches')
export class PharmacyBranch {
  @PrimaryGeneratedColumn()
  pharmacy_branch_id: number;

  @Column()
  pharmacy_id: number;

  @Column({ length: 150 })
  branch_name: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 100 })
  branch_manager: string;

  @Column({ default: true })
  is_active: boolean;

  @ManyToOne(() => Pharmacy, pharmacy => pharmacy.branches)
  @JoinColumn({ name: 'pharmacy_id' })
  pharmacy: Pharmacy;

  @OneToMany(() => Address, address => address.pharmacy_branch)
  addresses: Address[];

  @OneToMany(() => PharmacyBranchStock, stock => stock.pharmacy_branch)
  stock: PharmacyBranchStock[];

  @OneToMany(() => Reservation, reservation => reservation.pharmacy_branch)
  reservations: Reservation[];

  @OneToMany(() => Order, order => order.pharmacy_branch)
  orders: Order[];
}




