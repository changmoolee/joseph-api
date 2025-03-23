import { Controller, Get, Req } from '@nestjs/common';
import { GptService } from './gpt.service';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Get('generate')
  async generate(@Req() req: Request) {
    /** 관리자 전용 키 체크 */
    const adminKey = req.headers['x-admin-secret'];

    const result = await this.gptService.generatePost(adminKey);
    return { result };
  }
}
