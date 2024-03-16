import { MigrationInterface, QueryRunner } from "typeorm";

export class  AddEmailForUser1710482947779 implements MigrationInterface {
    name = ' AddEmailForUser1710482947779'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
    }

}
