import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GptService } from 'src/gpt/gpt.service';

@Injectable()
export class AutoPostCron {
  constructor(private readonly gptService: GptService) {}

  @Cron('0 3 * * *') // 매일 오전 12시 (UTC 3시 → KST 오전 12시)
  async handleCron() {
    /** 관리자 전용 키 */
    const adminKey = process.env.GENERATE_POST_API_KEY;

    await this.gptService.generatePost(adminKey);
  }
}
