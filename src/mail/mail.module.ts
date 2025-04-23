import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
  imports: [MailerModule],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
