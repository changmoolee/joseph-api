import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './follow.entity';
import { FollowController } from './follow.controller';
import { FollowService } from './follow.service';
import { JwtMiddleware } from 'src/middleware/jwt.middleware';
import { User } from 'src/user/user.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Follow, User])],
  providers: [FollowService],
  controllers: [FollowController],
})
export class FollowModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({ path: 'follow/user', method: RequestMethod.POST });
  }
}
