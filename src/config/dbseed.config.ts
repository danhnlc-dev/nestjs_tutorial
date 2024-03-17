import dbConfig from '@app/config/typeorm.config';

const dbseedconfig = {
  ...dbConfig,
  migrations: ['src/seeds/*.ts'],
};

export default dbseedconfig;
