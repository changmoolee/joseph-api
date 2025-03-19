import {
  Body,
  Res,
  Injectable,
  Param,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
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
    /** 이메일 중복 여부 */
    const isDuplicateEmail = await this.userRepository.findOne({
      where: { email: userDto.email },
    });

    if (isDuplicateEmail) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

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
  }

  async signinUser(
    @Body() userDto: SigninUserDto,
    @Res() response: Response,
  ): Promise<void> {
    // https://docs.nestjs.com/security/authentication
    const findUser = await this.userRepository.findOne({
      where: { email: userDto.email },
    });

    if (!findUser) {
      throw new NotFoundException('존재하지 않는 이메일입니다.');
    }

    /** 패스워드 일치 여부 */
    const isMatch = await bcrypt.compare(userDto.password, findUser.password);

    // 불일치시 에러
    if (!isMatch) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
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
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // 배포 환경에서는 None, 로컬에서는 Strict
      maxAge: 2 * 60 * 60 * 1000, // 2시간 후 만료
      domain:
        process.env.NODE_ENV === 'production'
          ? 'joseph-instagram.vercel.app'
          : 'localhost',
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
    const findUser = await this.userRepository.findOne({
      where: { id, email: userDto.email },
    });

    if (!findUser) {
      throw new NotFoundException('회원 데이터를 찾지 못했습니다.');
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
  }

  async deleteUser(
    @Param('id') id: number,
    @Res() response: Response,
  ): Promise<void> {
    const findUser = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!findUser) {
      throw new NotFoundException(`탈퇴할 회원이 존재하지 않습니다.`);
    }

    await this.userRepository
      .createQueryBuilder('user')
      .softDelete()
      .where('id = :id', { id })
      .andWhere('email = :email', { email: findUser.email })
      .execute();

    response.clearCookie('token');

    response.json({
      data: null,
      result: 'success',
      message: `user_id :${id} email : ${findUser.email} 회원의 계정을 탈퇴하였습니다.`,
    });
  }
}
