import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GptController } from './gpt.controller';
import { GptService } from './gpt.service';
import { User } from 'src/user/user.entity';
import { Post } from 'src/post/post.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Post, User])],
  providers: [GptService],
  controllers: [GptController],
})
export class GptModule {}
