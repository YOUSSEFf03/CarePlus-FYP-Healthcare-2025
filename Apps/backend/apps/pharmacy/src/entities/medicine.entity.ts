import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Item } from './item.entity';
import { Reservation } from './reservation.entity';

@Entity('medicines')
export class Medicine {
  @PrimaryGeneratedColumn()
  medicine_id: number;

  @Column()
  item_id: number;

  @Column({ default: false })
  prescription_required: boolean;

  @Column({ default: false })
  requires_approval: boolean;

  @Column({ length: 50 })
  type: string;

  @Column({ length: 50 })
  dosage: string;

  @ManyToOne(() => Item, item => item.medicines)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @OneToMany(() => Reservation, reservation => reservation.medicine)
  reservations: Reservation[];
}



