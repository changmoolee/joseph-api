import { Body, Res, Injectable, Param, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import * as bcrypt from 'bcrypt';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import * as jose from 'jose';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { SigninUserDto } from 'src/auth/dto/signin-user.dto';
import { Response } from 'express';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';

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

  async signinUser(
    @Body() userDto: SigninUserDto,
    @Res() response: Response,
  ): Promise<void> {
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
        secure: process.env.NODE_ENV === 'production', // HTTPS 환경에서만 쿠키 전송 (배포 환경에서는 true)
        sameSite: 'strict', // CSRF 공격 방지
        maxAge: 2 * 60 * 60 * 1000, // 2시간 후 만료
      });

      response.json({
        data: {
          id: findUser.id,
          email: findUser.email,
          image_url: findUser.image_url,
          username: findUser.username,
        },
        result: 'success',
        message: '로그인을 성공하였습니다.',
      });
    } catch (error) {
      console.error(error);

      response.json({
        data: {},
        result: 'failure',
        message: '',
      });
    }
  }

  async signoutUser(response: Response) {
    response.clearCookie('token');

    response.json({
      data: null,
      result: 'success',
      message: '로그아웃하였습니다.',
    });
  }

  async updateUser(
    @Param('id') id: number,
    @Body() userDto: UpdateUserDto,
  ): Promise<ApiResponseDto<User>> {
    try {
      const findUser = await this.userRepository.findOne({
        where: { id, email: userDto.email },
      });

      if (!findUser) {
        return {
          data: null,
          result: 'failure',
          message: '회원 데이터를 찾지 못했습니다.',
        };
      }

      if (userDto.username) {
        findUser.username = userDto.username;
      }

      if (userDto.password) {
        // cost 10
        const saltRounds = 10;

        /** 해싱처리한 패스워드 */
        const hashedPassword = await bcrypt.hash(userDto.password, saltRounds);

        findUser.password = hashedPassword;
      }

      await this.userRepository.save(findUser);

      return {
        data: findUser,
        result: 'success',
        message: `id ${findUser.id} 회원의 데이터를 수정 완료하였습니다.`,
      };
    } catch (error) {
      console.error(error);

      return {
        data: null,
        result: 'failure',
        message: 'api 호출 에러',
      };
    }
  }

  async deleteUser(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<ApiResponseDto<null>> {
    try {
      const findUser = await this.userRepository.findOne({
        where: {
          id,
        },
      });

      if (!findUser) {
        return {
          data: null,
          result: 'failure',
          message: `user_id :${id} email : ${findUser.email} 회원이 존재하지 않습니다.`,
        };
      }

      await this.userRepository
        .createQueryBuilder('user')
        .softDelete()
        .where('id = :id', { id })
        .andWhere('email = :email', { email: findUser.email })
        .execute();

      return {
        data: null,
        result: 'success',
        message: `user_id :${id} email : ${findUser.email} 회원의 계정을 탈퇴하였습니다.`,
      };
    } catch (error) {
      console.error(error);

      /** jwt 미들웨어에서 넘겨준 유저 정보 */
      const email = req['user'].email;

      return {
        data: null,
        result: 'failure',
        message: `user_id :${id} email : ${email} 회원의 계정 탈퇴를 실패하였습니다.`,
      };
    }
  }
}
