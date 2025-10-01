import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';
@Entity('doctor_analytics')
@Index(['doctorId', 'period', 'periodType'])
export class DoctorAnalytics {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column()
    doctorId: string;
    @Column({ type: 'date' })
    period: string; // YYYY-MM-DD for daily, YYYY-MM for monthly, YYYY-WW for weekly
    @Column({ type: 'varchar', length: 10 })
    periodType: 'daily' | 'weekly' | 'monthly';
    @Column({ type: 'int', default: 0 })
    totalAppointments: number;
    @Column({ type: 'int', default: 0 })
    completedAppointments: number;
    @Column({ type: 'int', default: 0 })
    newPatients: number;
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalRevenue: number;
    @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
    averageRating: number;
    @Column({ type: 'int', default: 0 })
    totalReviews: number;
    @CreateDateColumn()
    created_at: Date;
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}