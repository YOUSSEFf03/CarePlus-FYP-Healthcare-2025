import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Category } from './category.entity';
import { Medicine } from './medicine.entity';
import { PharmacyBranchStock } from './pharmacy-branch-stock.entity';
import { OrderItem } from './order-item.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  item_id: number;

  @Column()
  category_id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 150 })
  manufacturer: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  image_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Category, category => category.items)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Medicine, medicine => medicine.item)
  medicines: Medicine[];

  @OneToMany(() => PharmacyBranchStock, stock => stock.item)
  pharmacy_stock: PharmacyBranchStock[];

  @OneToMany(() => OrderItem, orderItem => orderItem.item)
  order_items: OrderItem[];
}




