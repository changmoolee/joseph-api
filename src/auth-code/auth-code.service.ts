import { Body, Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { SendAuthCodeDto } from 'src/auth-code/dto/send-auth-code.dto';
import * as crypto from 'crypto';

/**
 * 참조 : https://nest-modules.github.io/mailer/docs/mailer.html
 */

@Injectable()
export class AuthCodeService {
  constructor(private readonly mailerService: MailerService) {}

  async sendAuthCode(
    @Req() req: Request,
    @Body() emailDto: SendAuthCodeDto,
  ): Promise<ApiResponseDto<null>> {
    /** 애플리케이션 전용 키 체크 */
    const appSecret = req.headers['x-app-secret'];

    if (appSecret !== process.env.MAIL_AUTH_CODE_API_KEY) {
      throw new UnauthorizedException('접근 권한이 없습니다.');
    }

    /** 6자리 문자열 */
    const uuid = crypto.randomUUID().slice(0, 6);

    await this.mailerService.sendMail({
      to: emailDto.email,
      from: process.env.MAIL_USER,
      subject: '[joseph-instagram] 카카오 소셜 로그인 가입 인증코드',
      html: `<section>
      <div>인증코드 input에 아래 인증코드를 입력하고 '인증'버튼을 눌러주세요.</div>
      <b>인증 코드 : ${uuid}</b>
      </section>`,
    });

    return {
      data: null,
      result: 'success',
      message: `해당 이메일에 6자리 인증코드를 발송하였습니다. \n5분안에 인증을 완료해주세요.`,
    };
  }
}
