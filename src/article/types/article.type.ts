import { ArticleEntity } from '@app/article/article.entity';

export type ArtticleType = Omit<ArticleEntity, 'updateTimestamp'>;
