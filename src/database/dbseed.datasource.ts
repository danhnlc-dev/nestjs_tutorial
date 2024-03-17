import dbseedconfig from '@app/config/dbseed.config';
import { DataSource } from 'typeorm';

export default new DataSource(dbseedconfig);
