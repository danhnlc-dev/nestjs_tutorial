import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDB1710643398309 implements MigrationInterface {
  name = 'SeedDB1710643398309';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO users (username, email, password) values ('danhnlc', 'danhnlc@gmail.com', 'danhnlc123')`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") 
      values ('first article', 'first article', 'first desc', 'first content', 'angularjs,reactjs,vuejs', 1),
      ('second article', 'second article', 'second desc', 'second content', 'reactjs', 1),
      ('third article', 'third article', 'third desc', 'third content', 'angularjs', 1)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
