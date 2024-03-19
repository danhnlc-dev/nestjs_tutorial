import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { ArticleEntity } from '@app/article/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UserEntity } from '@app/user/user.entity';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import slugify from 'slugify';
import { UpdateArticleDto } from '@app/article/dto/updateArticle.dto';
import { ArticlesResponseInterface } from '@app/article/types/articlesResponse.interface';
import { FollowEntity } from '@app/profile/follow.entity';
import { ErrorService } from '@app/shared/services/error.service';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
    private readonly errorService: ErrorService,
  ) {}

  async findAll(
    currentUser: UserEntity,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      const user = await this.userRepository.findOne({
        where: { username: query.author },
      });
      queryBuilder.andWhere('articles.author.id = :id', {
        id: user.id,
      });
    }

    let articleIds: number[] = [];

    if (query.favorited) {
      const user = await this.userRepository.findOne({
        where: { username: query.favorited },
        relations: ['favorites'],
      });

      articleIds = user.favorites.map((articleFavorite) => articleFavorite.id);
      if (articleIds.length) {
        queryBuilder.andWhere('articles.id IN (:...articleIds)', {
          articleIds,
        });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    if (!articleIds.length && currentUser) {
      const user = await this.userRepository.findOne({
        where: { id: currentUser.id },
        relations: ['favorites'],
      });

      articleIds = user.favorites.map((articleFavorite) => articleFavorite.id);
    }

    const articles = await queryBuilder.getMany();
    const articlesWithFavorites = articles.map((article) => {
      const favorited = articleIds.includes(article.id);
      return {
        ...article,
        favorited,
      };
    });

    return {
      articles: articlesWithFavorites,
      articlesCount,
    };
  }

  async getFeed(
    userId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const follows = await this.followRepository.find({
      where: { followerId: userId },
    });

    if (!follows.length) {
      return { articles: [], articlesCount: 0 };
    }

    const followingUserIds = follows.map((follow) => follow.followingId);
    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN (:...ids)', { ids: followingUserIds });

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();

    return { articles, articlesCount };
  }

  async createArticle(
    user: UserEntity,
    createArticle: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const newArticle = new ArticleEntity();
    Object.assign(newArticle, createArticle);
    if (!newArticle.tagList) {
      newArticle.tagList = [];
    }

    newArticle.slug = this.getSlug(newArticle.title);
    newArticle.author = user;

    return await this.articleRepository.save(newArticle);
  }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOne({
      where: { slug },
    });
  }

  async deleteArticle(userId: number, slug: string): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);
    if (!article) {
      this.errorService.errorResponse(
        'Article does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    if (article.author.id !== userId) {
      this.errorService.errorResponse(
        'You are not an author',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.articleRepository.delete({ slug });
  }

  async updateArticle(
    userId: number,
    slug: string,
    updatedArticleDto: UpdateArticleDto,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    if (!article) {
      this.errorService.errorResponse(
        'Article does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    if (article.author.id !== userId) {
      this.errorService.errorResponse(
        'You are not an author',
        HttpStatus.FORBIDDEN,
      );
    }

    Object.assign(article, updatedArticleDto);

    article.slug = this.getSlug(article.title);

    return await this.articleRepository.save(article);
  }

  async addArticleToFavorite(
    userId: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['favorites'],
    });

    const isNotFavorite =
      user.favorites.findIndex(
        (articleFavorite) => articleFavorite.id === article.id,
      ) === -1;

    if (isNotFavorite) {
      user.favorites.push(article);
      article.favoriteCount++;
      this.userRepository.save(user);
      this.articleRepository.save(article);
    }

    return article;
  }

  async deleteArticleFromFavorites(
    userId: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['favorites'],
    });

    const favoriteIdx = user.favorites.findIndex(
      (articleFavorite) => articleFavorite.id === article.id,
    );
    if (favoriteIdx !== -1) {
      user.favorites.splice(favoriteIdx, 1);
      article.favoriteCount--;
      this.userRepository.save(user);
      this.articleRepository.save(article);
    }

    return article;
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
