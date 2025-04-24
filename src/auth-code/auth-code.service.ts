import { BadRequestException, Body, Injectable, Req } from '@nestjs/common';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import { MailerService } from '@nestjs-modules/mailer';
import {
  SendAuthCodeDto,
  VerifyAuthCodeDto,
} from 'src/auth-code/dto/auth-code.dto';
import * as crypto from 'crypto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

/**
 * 참조 : https://nest-modules.github.io/mailer/docs/mailer.html
 */

@Injectable()
export class AuthCodeService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly mailerService: MailerService,
  ) {}

  async sendAuthCode(
    @Req() req: Request,
    @Body() emailDto: SendAuthCodeDto,
  ): Promise<ApiResponseDto<null>> {
    /** 애플리케이션 전용 키 체크 */
    const appSecret = req.headers['x-app-secret'];

    if (appSecret !== process.env.MAIL_AUTH_CODE_API_KEY) {
      throw new BadRequestException('접근 권한이 없습니다.');
    }

    /** 6자리 문자열 */
    const code = crypto.randomUUID().slice(0, 6);

    /**
     * redis에 발급한 6자리 문자열 code를 저장
     */
    await this.redis.set(`email:${emailDto.email}`, code, 'EX', 300); // 5분 유효

    // 메일 내용에 인증코드를 담는다.
    await this.mailerService.sendMail({
      to: emailDto.email,
      from: process.env.MAIL_USER,
      subject: '[joseph-instagram] 카카오 소셜 로그인 가입 인증코드',
      html: `<section>
      <div>인증코드 input에 아래 인증코드를 입력하고 '인증'버튼을 눌러주세요.</div>
      <b>인증 코드 : ${code}</b>
      </section>`,
    });

    return {
      data: null,
      result: 'success',
      message: `입력하신 이메일에 인증코드를 발송하였습니다.\n인증을 진행해주세요.`,
    };
  }

  async verifyAuthCode(
    @Body() verifyDto: VerifyAuthCodeDto,
  ): Promise<ApiResponseDto<null>> {
    /**
     * redis에서 가져온 code
     */
    const savedCode = await this.redis.get(`email:${verifyDto.email}`);

    // redis에 저장된 code와 비교한다.
    if (verifyDto.code !== savedCode) {
      throw new BadRequestException('인증번호가 틀렸습니다.');
    }

    return {
      data: null,
      result: 'success',
      message: `인증이 완료되었습니다.`,
    };
  }
}
