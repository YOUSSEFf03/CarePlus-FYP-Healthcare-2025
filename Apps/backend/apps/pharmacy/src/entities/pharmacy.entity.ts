import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { PharmacyBranch } from './pharmacy-branch.entity';

@Entity('pharmacies')
export class Pharmacy {
  @PrimaryGeneratedColumn()
  pharmacy_id: number;

  @Column()
  user_id: number;

  @Column({ length: 100 })
  pharmacy_owner: string;

  @Column({ length: 150 })
  pharmacy_name: string;

  @ManyToOne(() => User, user => user.pharmacies)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => PharmacyBranch, branch => branch.pharmacy)
  branches: PharmacyBranch[];
}



