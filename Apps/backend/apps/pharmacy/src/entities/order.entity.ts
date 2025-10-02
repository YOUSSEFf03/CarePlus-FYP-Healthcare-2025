import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from 'typeorm';
import { PharmacyBranch } from './pharmacy-branch.entity';
import { OrderItem } from './order-item.entity';
import { Delivery } from './delivery.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  order_id: number;

  @Column()
  patient_id: number;

  @Column()
  pharmacy_branch_id: number;

  @Column({ nullable: true })
  prescription_id: number;

  @CreateDateColumn()
  order_date: Date;

  @Column({ length: 50 })
  status: string;

  @Column({ length: 50 })
  payment_method: string;

  @Column({ length: 50 })
  payment_status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => PharmacyBranch, branch => branch.orders)
  @JoinColumn({ name: 'pharmacy_branch_id' })
  pharmacy_branch: PharmacyBranch;

  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  order_items: OrderItem[];

  @OneToMany(() => Delivery, delivery => delivery.order)
  deliveries: Delivery[];
}




