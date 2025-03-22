import { Controller, Get } from '@nestjs/common';
import { GptService } from './gpt.service';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Get('generate')
  async generate() {
    const result = await this.gptService.generatePost();
    return { result };
  }
}
