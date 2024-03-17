import { ArtticleType } from '@app/article/types/article.type';

export interface ArticlesResponseInterface {
  articles: ArtticleType[];
  articlesCount: number;
}
