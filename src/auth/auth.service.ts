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
import { SigninGoogleDto } from 'src/auth/dto/signin-google.dto';
import { SigninKakaoDto, KakaoUserDto } from 'src/auth/dto/signin-kakao.dto';
import { SigninNaverDto } from 'src/auth/dto/signin-naver.dto';

// 개발환경 여부
const isDevelopment = process.env.NODE_ENV === 'development';

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
    const findDuplicateEmail = await this.userRepository.findOne({
      where: { email: userDto.email },
      withDeleted: true, // ‼️ 소프트 딜리트된 항목도 포함
    });

    if (!!findDuplicateEmail) {
      throw new ConflictException(
        `email : ${userDto.email} - 이미 가입된 이메일입니다.\n기존 ${findDuplicateEmail.provider ? '플랫폼 : ' + findDuplicateEmail.provider : '이메일'}으로 로그인해주세요.`,
      );
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
      withDeleted: true, // ‼️ 소프트 딜리트된 항목도 포함
    });

    if (!findUser) {
      throw new NotFoundException('존재하지 않는 이메일입니다.');
    }

    /** 탈퇴 여부 */
    const isDeleted = findUser && findUser.deleted_at !== null;

    // 탈퇴한 회원일 경우
    if (isDeleted) {
      // soft deleted 된 계정을 복구한다.
      findUser.deleted_at = null;
      await this.userRepository.save(findUser);
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

    response.json({
      data: {
        token, // token 값을 전달 (25.03.21 iOS Safari 이슈로 쿠키 방식에서 수정)
        isDeleted, // 탈퇴 후 재로그인 여부 전달 (25.04.24 새로 isDeleted 추가)
        id: findUser.id,
        email: findUser.email,
        image_url: findUser.image_url,
        username: findUser.username,
        provider: null,
      },
      result: 'success',
      message: isDeleted
        ? '탈퇴된 계정을 복구하고 로그인에 성공하였습니다.'
        : '로그인을 성공하였습니다.',
    });
  }

  async signoutUser(response: Response) {
    /** 현재 쿠키 로그인 방식을 사용하지 않으므로 주석 처리 */
    // response.clearCookie('token', {
    //   httpOnly: true, // XSS 공격 방지
    //   secure: process.env.NODE_ENV === 'production', // HTTPS 환경에서만 쿠키 전송 (배포 환경에서는 true)
    //   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // 배포 환경에서는 None, 로컬에서는 Strict
    // });

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

  async signinGoogle(
    @Body() googleDto: SigninGoogleDto,
    @Res() response: Response,
  ): Promise<void> {
    // 구글 - 클라이언트로부터 받은 code
    const { code } = googleDto;

    // access_token 받기 위한 요청
    const googleResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: isDevelopment
          ? process.env.LOCAL_CLIENT_ID
          : process.env.CLIENT_ID,
        client_secret: isDevelopment
          ? process.env.LOCAL_CLIENT_SECRET
          : process.env.CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: isDevelopment
          ? process.env.LOCAL_REDIRECT_URL
          : process.env.REDIRECT_URL,
      }),
    });

    const jsonResponse = await googleResponse.json();

    const access_token = jsonResponse.access_token;

    // 구글로부터 사용자 정보 받기 위한 요청
    const userinfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo`,
      {
        method: 'GET',
        headers: {
          Authorization: ` Bearer ${access_token}`,
        },
      },
    );

    const {
      id: provider_id,
      email,
      name: username,
      picture: image_url,
    } = await userinfoResponse.json();

    let id;

    const findUser = await this.userRepository.findOne({
      where: { provider_id },
      withDeleted: true, // ‼️ 소프트 딜리트된 항목도 포함
    });
    /** 탈퇴 여부 */
    const isDeleted = findUser && findUser.deleted_at !== null;

    // 탈퇴한 회원일 경우
    if (isDeleted) {
      // soft deleted 된 계정을 복구한다.
      findUser.deleted_at = null;
      await this.userRepository.save(findUser);
    }

    // 기존 provider_id가 없다면, 구글 소셜 신규회원
    if (!findUser) {
      /** 이메일 중복 여부 확인 (다른 플랫폼으로 가입 여부) */
      const findDuplicateEmail = await this.userRepository.findOne({
        where: { email },
        withDeleted: true, // ‼️ 소프트 딜리트된 항목도 포함
      });

      if (!!findDuplicateEmail) {
        throw new ConflictException(
          `email : ${email} - 이미 가입된 이메일입니다.\n기존 ${findDuplicateEmail.provider ? '플랫폼 : ' + findDuplicateEmail.provider : '이메일'}으로 로그인해주세요.`,
        );
      }

      const result = await this.userRepository
        .createQueryBuilder('user')
        .insert()
        .into(User)
        .values({
          email,
          username,
          image_url,
          provider: 'google',
          provider_id,
        })
        .execute();

      id = result.raw.insertId;
    } else {
      id = findUser.id;
    }

    const JWT_SECRET = process.env.JWT_SECRET || '';

    const alg = 'HS256';

    // JWT token
    const token = await new jose.SignJWT({
      id,
      email,
    })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(new TextEncoder().encode(JWT_SECRET));

    response.json({
      data: {
        token, // token 값을 전달 (25.03.21 iOS Safari 이슈로 쿠키 방식에서 수정)
        isDeleted, // 탈퇴 후 재로그인 여부 전달 (25.04.24 새로 isDeleted 추가)
        id,
        email,
        image_url,
        username,
        provider: 'google',
      },
      result: 'success',
      message: isDeleted
        ? '탈퇴된 계정을 복구하고 구글 로그인에 성공하였습니다.'
        : '구글 로그인을 성공하였습니다.',
    });
  }

  async signinKakao(
    @Body() kakaoDto: SigninKakaoDto,
    @Res() response: Response,
  ): Promise<void> {
    // 카카오 - 클라이언트로부터 받은 code
    const { code } = kakaoDto;

    // access_token 받기 위한 요청
    const kakaoResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: new URLSearchParams({
        code,
        client_id: isDevelopment
          ? process.env.LOCAL_KAKAO_CLIENT_ID
          : process.env.KAKAO_CLIENT_ID,
        client_secret: isDevelopment
          ? process.env.LOCAL_KAKAO_CLIENT_SECRET
          : process.env.KAKAO_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: isDevelopment
          ? process.env.LOCAL_KAKAO_REDIRECT_URL
          : process.env.KAKAO_REDIRECT_URL,
      }),
    });

    const jsonResponse = await kakaoResponse.json();

    const access_token = jsonResponse.access_token;

    // 카카오로부터 사용자 정보 받기 위한 요청
    const userinfoResponse = await fetch(`https://kapi.kakao.com/v2/user/me`, {
      method: 'GET',
      headers: {
        Authorization: ` Bearer ${access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    const {
      id: provider_id,
      properties: { nickname, profile_image },
    } = await userinfoResponse.json();

    const findUser = await this.userRepository.findOne({
      where: { provider_id },
      withDeleted: true, // ‼️ 소프트 딜리트된 항목도 포함
    });

    /** 탈퇴 여부 */
    const isDeleted = findUser && findUser.deleted_at !== null;

    // 탈퇴한 회원일 경우
    if (isDeleted) {
      // soft deleted 된 계정을 복구한다.
      findUser.deleted_at = null;
      await this.userRepository.save(findUser);
    }

    // 회원 존재 (기가입 회원일 경우)
    if (findUser) {
      // 탈퇴한 회원일 경우
      if (typeof findUser.deleted_at !== null) {
        // soft deleted 된 계정을 복구한다.
        findUser.deleted_at = null;
        await this.userRepository.save(findUser);
      }

      const JWT_SECRET = process.env.JWT_SECRET || '';

      const alg = 'HS256';

      // JWT token
      const token = await new jose.SignJWT({
        id: findUser.id,
        email: findUser.email,
      })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(new TextEncoder().encode(JWT_SECRET));

      // 바로 토큰 전송
      response.json({
        data: {
          token, // token 값을 전달 (25.03.21 iOS Safari 이슈로 쿠키 방식에서 수정)
          isDeleted, // 탈퇴 후 재로그인 여부 전달 (25.04.24 새로 isDeleted 추가)
          id: findUser.id,
          email: findUser.email,
          image_url: findUser.image_url,
          username: findUser.username,
          provider: 'kakao',
        },
        result: 'success',
        message: isDeleted
          ? '탈퇴된 계정을 복구하고 카카오 로그인에 성공하였습니다.'
          : '카카오 로그인을 성공하였습니다.',
      });
    } else {
      // 클라이언트에 회원가입에 필요한 카카오 id 및 회원정보 전달
      response.json({
        data: {
          provider_id,
          image_url: profile_image,
          username: nickname,
        },
        result: 'success',
        message: '회원가입 완료를 위해 이메일 입력을 진행합니다.',
      });
    }
  }

  async completeKakaoSignup(
    @Body() userDto: KakaoUserDto,
    @Res() response: Response,
  ) {
    const { provider_id, email, image_url, username } = userDto;

    /** 이메일 중복 여부 */
    const findDuplicateEmail = await this.userRepository.findOne({
      where: {
        email,
      },
      withDeleted: true, // ‼️ 소프트 딜리트된 항목도 포함
    });

    if (!!findDuplicateEmail) {
      throw new ConflictException(
        `email : ${email} - 이미 가입된 이메일입니다.\n기존 ${findDuplicateEmail.provider ? '플랫폼 : ' + findDuplicateEmail.provider : '이메일'}으로 로그인해주세요.`,
      );
    }

    // https://typeorm.io/insert-query-builder
    const result = await this.userRepository
      .createQueryBuilder('user')
      .insert()
      .into(User)
      .values({
        email,
        image_url,
        username,
        provider_id,
        provider: 'kakao',
      })
      .execute();

    const id = result.raw.insertId;

    const JWT_SECRET = process.env.JWT_SECRET || '';

    const alg = 'HS256';

    // JWT token
    const token = await new jose.SignJWT({
      id,
      email,
    })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(new TextEncoder().encode(JWT_SECRET));

    response.json({
      data: {
        token, // token 값을 전달 (25.03.21 iOS Safari 이슈로 쿠키 방식에서 수정)
        id,
        email,
        image_url,
        username,
        provider: 'kakao',
      },
      result: 'success',
      message: '카카오 로그인을 성공하였습니다.',
    });
  }

  async signinNaver(
    @Body() naverDto: SigninNaverDto,
    @Res() response: Response,
  ): Promise<void> {
    // 네이버 - 클라이언트로부터 받은 code 및 state 문자열
    const { code, state } = naverDto;

    // access_token 받기 위한 요청
    const naverResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: isDevelopment
          ? process.env.LOCAL_NAVER_CLIENT_ID
          : process.env.NAVER_CLIENT_ID,
        client_secret: isDevelopment
          ? process.env.LOCAL_NAVER_CLIENT_SECRET
          : process.env.NAVER_CLIENT_SECRET,
        grant_type: 'authorization_code',
        state,
      }),
    });

    const jsonResponse = await naverResponse.json();

    const access_token = jsonResponse.access_token;

    // 네이버로부터 사용자 정보 받기 위한 요청
    const userinfoResponse = await fetch(
      `https://openapi.naver.com/v1/nid/me`,
      {
        method: 'GET',
        headers: {
          Authorization: ` Bearer ${access_token}`,
        },
      },
    );

    const {
      // message,
      response: userinfo,
    } = await userinfoResponse.json();

    const {
      id: provider_id,
      email,
      nickname,
      name,
      profile_image: image_url,
    } = userinfo;

    const username = name || nickname;

    let id;

    const findUser = await this.userRepository.findOne({
      where: { provider_id },
      withDeleted: true, // ‼️ 소프트 딜리트된 항목도 포함
    });

    /** 탈퇴 여부 */
    const isDeleted = findUser && findUser.deleted_at !== null;

    // 탈퇴한 회원일 경우
    if (isDeleted) {
      // soft deleted 된 계정을 복구한다.
      findUser.deleted_at = null;
      await this.userRepository.save(findUser);
    }

    // 기존 provider_id가 없다면, 네이버 소셜 신규회원
    if (!findUser) {
      /** 이메일 중복 여부 확인 (다른 플랫폼으로 가입 여부) */
      const findDuplicateEmail = await this.userRepository.findOne({
        where: { email },
        withDeleted: true, // ‼️ 소프트 딜리트된 항목도 포함
      });

      if (!!findDuplicateEmail) {
        throw new ConflictException(
          `email : ${email} - 이미 가입된 이메일입니다.\n기존 ${findDuplicateEmail.provider ? '플랫폼 : ' + findDuplicateEmail.provider : '이메일'}으로 로그인해주세요.`,
        );
      }

      const result = await this.userRepository
        .createQueryBuilder('user')
        .insert()
        .into(User)
        .values({
          email,
          username,
          image_url,
          provider: 'naver',
          provider_id,
        })
        .execute();

      id = result.raw.insertId;
    } else {
      id = findUser.id;
    }

    const JWT_SECRET = process.env.JWT_SECRET || '';

    const alg = 'HS256';

    // JWT token
    const token = await new jose.SignJWT({
      id,
      email,
    })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(new TextEncoder().encode(JWT_SECRET));

    response.json({
      data: {
        token, // token 값을 전달 (25.03.21 iOS Safari 이슈로 쿠키 방식에서 수정)
        isDeleted, // 탈퇴 후 재로그인 여부 전달 (25.04.24 새로 isDeleted 추가)
        id,
        email,
        image_url,
        username,
        provider: 'naver',
      },
      result: 'success',
      message: isDeleted
        ? '탈퇴된 계정을 복구하고 네이버 로그인에 성공하였습니다.'
        : '네이버 로그인을 성공하였습니다.',
    });
  }
}
