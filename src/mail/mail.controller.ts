import { Body, Controller, Post, Req } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendEmailDto } from 'src/mail/dto/send-email.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('code')
  async sendAuthCode(@Req() req: Request, @Body() emailDto: SendEmailDto) {
    return this.mailService.sendAuthCode(req, emailDto);
  }
}
