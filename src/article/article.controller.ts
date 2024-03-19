import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ArticleService } from '@app/article/article.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/user/decorators/user.decorator';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { UserEntity } from '@app/user/user.entity';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import { UpdateArticleDto } from '@app/article/dto/updateArticle.dto';
import { ArticlesResponseInterface } from '@app/article/types/articlesResponse.interface';
import { BackendValidationPipe } from '@app/shared/pipes/backendValidation.pipe';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articlesService: ArticleService) {}

  @Get()
  async findAll(
    @User() user: UserEntity,
    @Query() query: any,
  ): Promise<ArticlesResponseInterface> {
    return await this.articlesService.findAll(user, query);
  }

  @Get('feed')
  @UseGuards(AuthGuard)
  async getFeed(
    @User('id') userId: number,
    @Query() query: any,
  ): Promise<ArticlesResponseInterface> {
    return await this.articlesService.getFeed(userId, query);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async createArticle(
    @User() user: UserEntity,
    @Body('article') articleDto: CreateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articlesService.createArticle(user, articleDto);
    return this.articlesService.buildArticleResponse(article);
  }

  @Get(':slug')
  async getSingleArticle(
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articlesService.findBySlug(slug);
    return this.articlesService.buildArticleResponse(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticle(
    @User('id') userId: number,
    @Param('slug') slug: string,
  ): Promise<any> {
    return await this.articlesService.deleteArticle(userId, slug);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updateArticle(
    @User('id') userId: number,
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articlesService.updateArticle(
      userId,
      slug,
      updateArticleDto,
    );
    return this.articlesService.buildArticleResponse(article);
  }

  @Post(':slug/favorite')
  async addArticleToFavorite(
    @User('id') userId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articlesService.addArticleToFavorite(
      userId,
      slug,
    );
    return this.articlesService.buildArticleResponse(article);
  }

  @Delete(':slug/favorite')
  async deleteArticleFromFavorite(
    @User('id') userId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articlesService.deleteArticleFromFavorites(
      userId,
      slug,
    );
    return this.articlesService.buildArticleResponse(article);
  }
}
