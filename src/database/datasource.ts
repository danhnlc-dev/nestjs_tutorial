import dbConfig from '@app/config/typeorm.config';
import { DataSource } from 'typeorm';

export default new DataSource(dbConfig);
