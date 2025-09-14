import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn, JoinColumn } from 'typeorm';
import { PharmacyBranch } from './pharmacy-branch.entity';
import { Item } from './item.entity';

@Entity('pharmacy_branch_stock')
export class PharmacyBranchStock {
  @PrimaryGeneratedColumn()
  pharmacy_branch_stock_id: number;

  @Column()
  pharmacy_branch_id: number;

  @Column()
  item_id: number;

  @Column()
  quantity: number;

  @UpdateDateColumn()
  last_updated: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  initial_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  sold_price: number;

  @Column({ type: 'date', nullable: true })
  expiry_date: Date;

  @ManyToOne(() => PharmacyBranch, branch => branch.stock)
  @JoinColumn({ name: 'pharmacy_branch_id' })
  pharmacy_branch: PharmacyBranch;

  @ManyToOne(() => Item, item => item.pharmacy_stock)
  @JoinColumn({ name: 'item_id' })
  item: Item;
}
