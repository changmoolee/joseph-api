import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutoPostCron } from './auto-post.cron';
import { GptModule } from 'src/gpt/gpt.module';

@Module({
  imports: [GptModule, TypeOrmModule.forFeature([])],
  providers: [AutoPostCron],
})
export class CronModule {}
