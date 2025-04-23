import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthCodeService } from './auth-code.service';
import { SendAuthCodeDto } from 'src/auth-code/dto/send-auth-code.dto';

@Controller('auth-code')
export class AuthCodeController {
  constructor(private readonly mailService: AuthCodeService) {}

  @Post('send')
  async sendAuthCode(@Req() req: Request, @Body() emailDto: SendAuthCodeDto) {
    return this.mailService.sendAuthCode(req, emailDto);
  }
}
