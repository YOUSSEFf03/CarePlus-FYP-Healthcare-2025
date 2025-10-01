import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveSlotDateFromAppointmentSlots1735750000000 implements MigrationInterface {
    name = 'RemoveSlotDateFromAppointmentSlots1735750000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment_slots" DROP COLUMN "slot_date"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment_slots" ADD "slot_date" date`);
    }
}
