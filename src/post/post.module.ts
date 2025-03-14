import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { User } from 'src/user/user.entity';
import { Like } from 'src/like/like.entity';
import { Bookmark } from 'src/bookmark/bookmark.entity';
import { JwtMiddleware } from 'src/middleware/jwt.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Like, Bookmark])],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(
        { path: 'post', method: RequestMethod.POST },
        { path: 'post/:id', method: RequestMethod.PUT },
        { path: 'post/:id', method: RequestMethod.DELETE },
      );
  }
}
