import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Item } from './item.entity';

@Entity('orders_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  order_item_id: number;

  @Column()
  order_id: number;

  @Column()
  item_id: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discount_applied: number;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @ManyToOne(() => Order, order => order.order_items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Item, item => item.order_items)
  @JoinColumn({ name: 'item_id' })
  item: Item;
}


