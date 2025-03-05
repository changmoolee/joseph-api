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

@Module({
  imports: [
    ConfigModule.forRoot(), // 환경 변수 로드
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, Post, Like, Bookmark, Comment], // 엔티티 추가 필수
      synchronize: true,
    }),
    // 모듈 추가 필수
    UserModule,
    PostModule,
    AuthModule,
    LikeModule,
    BookmarkModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
