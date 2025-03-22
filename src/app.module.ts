import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './user/user.entity'; // User 엔티티 추가
import { Post } from './post/post.entity'; // Post 엔티티 추가
import { UserModule } from 'src/user/user.module';
import { PostModule } from 'src/post/post.module';
import { AuthModule } from 'src/auth/auth.module';
import { LikeModule } from 'src/like/like.module';
import { Like } from 'src/like/like.entity';
import { BookmarkModule } from 'src/bookmark/bookmark.module';
import { Bookmark } from 'src/bookmark/bookmark.entity';
import { CommentModule } from 'src/comment/comment.module';
import { Comment } from 'src/comment/comment.entity';
import { FollowModule } from 'src/follow/follow.module';
import { Follow } from 'src/follow/follow.entity';
import { GptModule } from 'src/gpt/gpt.module';

// 개발환경 여부
const isDevelopment = process.env.NODE_ENV === 'development';

@Module({
  imports: [
    ConfigModule.forRoot(), // 환경 변수 로드
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: isDevelopment
        ? process.env.LOCAL_DATABASE_HOST
        : process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: isDevelopment
        ? process.env.LOCAL_DATABASE_USER
        : process.env.DATABASE_USER,
      password: isDevelopment
        ? process.env.LOCAL_DATABASE_PASSWORD
        : process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, Post, Like, Bookmark, Comment, Follow], // 엔티티 추가 필수
    }),
    // 모듈 추가 필수
    UserModule,
    PostModule,
    AuthModule,
    LikeModule,
    BookmarkModule,
    CommentModule,
    FollowModule,
    GptModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
