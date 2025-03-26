import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GptService } from 'src/gpt/gpt.service';

@Injectable()
export class AutoPostCron {
  constructor(private readonly gptService: GptService) {}

  @Cron('0 1,5 * * *') // UTC 기준: 오전 1시, 5시 → KST 기준: 오전 10시, 오후 2시
  async handleCron() {
    /** 관리자 전용 키 */
    const adminKey = process.env.GENERATE_POST_API_KEY;

    await this.gptService.generatePost(adminKey);
  }
}
