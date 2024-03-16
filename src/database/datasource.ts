import dbConfig from '@app/config/typeormconfig';
import {DataSource} from 'typeorm';

export default new DataSource(dbConfig);
