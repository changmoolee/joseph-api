import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthCodeService } from './auth-code.service';
import { AuthCodeController } from './auth-code.controller';

@Module({
  imports: [MailerModule],
  controllers: [AuthCodeController],
  providers: [AuthCodeService],
})
export class AuthCodeModule {}
