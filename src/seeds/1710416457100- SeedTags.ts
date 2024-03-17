import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedTags1710416457100 implements MigrationInterface {
  name = ' SeedTags1710416457100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags (name) values ('dragons'), ('mosquito'), ('butterfly')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
