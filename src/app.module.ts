import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { PostModule } from 'src/post/post.module';
import { AuthModule } from 'src/auth/auth.module';
import { LikeModule } from 'src/like/like.module';
import { BookmarkModule } from 'src/bookmark/bookmark.module';
import { CommentModule } from 'src/comment/comment.module';
import { FollowModule } from 'src/follow/follow.module';
import { GptModule } from 'src/gpt/gpt.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from 'src/cron/cron.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthCodeModule } from 'src/auth-code/auth-code.module';
import { RedisModule } from '@nestjs-modules/ioredis';

// 개발환경 여부
// const isDevelopment = process.env.NODE_ENV === 'development';

@Module({
  imports: [
    ConfigModule.forRoot(), // 환경 변수 로드
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'ep-ancient-grass-a1g766cv-pooler.ap-southeast-1.aws.neon.tech',
      port: 5432,
      username: process.env.NEON_DB_USERNAME,
      password: process.env.NEON_DB_PASSWORD,
      database: process.env.NEON_DB_DATABASE,
      ssl: true,
      autoLoadEntities: true,
      synchronize: false,
    }),
    ScheduleModule.forRoot(), // 스케줄 모듈 추가
    MailerModule.forRoot({
      // 메일 모듈 추가
      transport: {
        service: 'Gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
    }),
    RedisModule.forRoot({
      // https://www.npmjs.com/package/@nestjs-modules/ioredis
      type: 'single',
      url: 'redis://localhost:6379',
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
    CronModule,
    AuthCodeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
