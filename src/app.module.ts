import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { TagModule } from '@app/tag/tag.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import dbConfig from '@app/config/typeorm.config';
import { UserModule } from '@app/user/user.module';
import { AuthMiddleware } from '@app/user/middlewares/auth.middleware';
import { ArticleModule } from '@app/article/article.module';
import { ProfileModule } from '@app/profile/profile.module';
import { ErrorService } from '@app/shared/services/error.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig),
    TagModule,
    UserModule,
    ArticleModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService, ErrorService],
  exports: [ErrorService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
