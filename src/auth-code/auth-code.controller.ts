import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthCodeService } from './auth-code.service';
import {
  SendAuthCodeDto,
  VerifyAuthCodeDto,
} from 'src/auth-code/dto/auth-code.dto';

@Controller('auth-code')
export class AuthCodeController {
  constructor(private readonly mailService: AuthCodeService) {}

  @Post('send')
  async sendAuthCode(@Req() req: Request, @Body() emailDto: SendAuthCodeDto) {
    return this.mailService.sendAuthCode(req, emailDto);
  }

  @Post('verify')
  async verifyAuthCode(@Body() verifyDto: VerifyAuthCodeDto) {
    return this.mailService.verifyAuthCode(verifyDto);
  }
}
