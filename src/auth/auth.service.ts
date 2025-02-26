import { Body, Res, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import * as bcrypt from 'bcrypt';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import * as jose from 'jose';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { SigninUserDto } from 'src/auth/dto/signin-user.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    // UserRepository를 NestJS의 DI 시스템을 통해 주입받음
    @InjectRepository(User)
    // TypeORM의 저장소 객체
    // User 엔티티의 데이터베이스 조작을 위한 Repository
    private userRepository: Repository<User>,
  ) {}

  async signupUser(
    @Body() userDto: CreateUserDto,
  ): Promise<ApiResponseDto<[]>> {
    try {
      // cost 10
      const saltRounds = 10;

      /** 해싱처리한 패스워드 */
      const hashedPassword = await bcrypt.hash(userDto.password, saltRounds);

      // https://typeorm.io/insert-query-builder
      await this.userRepository
        .createQueryBuilder('user')
        .insert()
        .into(User)
        .values({
          ...userDto,
          password: hashedPassword,
        })
        .execute();

      return {
        data: [],
        result: 'success',
        message: '회원가입을 성공하였습니다.',
      };
    } catch (error) {
      console.error(error);

      return {
        data: [],
        result: 'failure',
        message: '회원가입을 실패하였습니다.',
      };
    }
  }

  async signinUser(@Body() userDto: SigninUserDto, @Res() response: Response) {
    try {
      // https://docs.nestjs.com/security/authentication
      const findUser = await this.userRepository.findOne({
        where: { email: userDto.email },
      });

      if (!findUser) {
        response.json({
          data: [],
          result: 'failure',
          message: '존재하지 않는 이메일입니다.',
        });
        return;
      }

      /** 패스워드 일치 여부 */
      const isMatch = await bcrypt.compare(userDto.password, findUser.password);

      // 불일치시 에러
      if (!isMatch) {
        response.json({
          data: [],
          result: 'failure',
          message: '비밀번호가 일치하지 않습니다.',
        });
        return;
      }

      const JWT_SECRET = process.env.JWT_SECRET || '';

      const alg = 'HS256';

      const token = await new jose.SignJWT({
        id: findUser.id,
        email: findUser.email,
      })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(new TextEncoder().encode(JWT_SECRET));

      response.cookie('token', token, {
        httpOnly: true, // XSS 공격 방지
        // secure: true, // HTTPS 환경에서만 쿠키 전송 (배포 환경에서는 true)
        sameSite: 'strict', // CSRF 공격 방지
        maxAge: 2 * 60 * 60 * 1000, // 2시간 후 만료
      });

      response.json({
        data: {
          id: findUser.id,
          email: findUser.email,
          image: findUser.image,
          username: findUser.username,
        },
        result: 'success',
        message: '로그인을 성공하였습니다.',
      });
      return;
    } catch (error) {
      console.error(error);

      response.json({
        data: [],
        result: 'failure',
        message: '',
      });
      return;
    }
  }
}
