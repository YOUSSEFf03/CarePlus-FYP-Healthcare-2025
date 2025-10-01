import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDayOfWeekToAppointmentSlots1735745000000 implements MigrationInterface {
    name = 'AddDayOfWeekToAppointmentSlots1735745000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment_slots" ADD "day_of_week" varchar(10)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment_slots" DROP COLUMN "day_of_week"`);
    }
}
