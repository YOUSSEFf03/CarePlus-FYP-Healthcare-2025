import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvailableDaysToWorkplace1735744000000 implements MigrationInterface {
    name = 'AddAvailableDaysToWorkplace1735744000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_workplaces" ADD "available_days" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_workplaces" DROP COLUMN "available_days"`);
    }
}
