import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Address } from './address.entity';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn()
  delivery_id: number;

  @Column()
  order_id: number;

  @Column()
  address_id: number;

  @Column({ length: 50 })
  delivery_method: string;

  @Column({ length: 50 })
  delivery_status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'date', nullable: true })
  scheduled_date: Date;

  @Column({ type: 'date', nullable: true })
  delivered_date: Date;

  @Column({ length: 100, nullable: true })
  tracking_number: string;

  @ManyToOne(() => Order, order => order.deliveries)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Address, address => address.deliveries)
  @JoinColumn({ name: 'address_id' })
  address: Address;
}
