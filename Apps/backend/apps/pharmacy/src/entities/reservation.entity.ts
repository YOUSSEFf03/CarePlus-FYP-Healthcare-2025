import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { PharmacyBranch } from './pharmacy-branch.entity';
import { Medicine } from './medicine.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  reservation_id: number;

  @Column()
  patient_id: number;

  @Column()
  pharmacy_branch_id: number;

  @Column()
  medicine_id: number;

  @Column({ nullable: true })
  prescription_id: number;

  @Column()
  quantity_reserved: number;

  @Column({ length: 50 })
  status: string;

  @CreateDateColumn()
  reserved_date: Date;

  @Column({ type: 'date', nullable: true })
  pickup_deadline: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => PharmacyBranch, branch => branch.reservations)
  @JoinColumn({ name: 'pharmacy_branch_id' })
  pharmacy_branch: PharmacyBranch;

  @ManyToOne(() => Medicine, medicine => medicine.reservations)
  @JoinColumn({ name: 'medicine_id' })
  medicine: Medicine;
}




