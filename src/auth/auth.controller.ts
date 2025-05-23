import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import { SigninUserDto } from 'src/auth/dto/signin-user.dto';
import { Response } from 'express';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';
import { User } from 'src/user/user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SigninGoogleDto } from 'src/auth/dto/signin-google.dto';
import { SigninKakaoDto, KakaoUserDto } from 'src/auth/dto/signin-kakao.dto';
import { SigninNaverDto } from 'src/auth/dto/signin-naver.dto';
import { VerifyPasswordDto } from 'src/auth/dto/verify-password';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signupUser(
    @Body() userDto: CreateUserDto,
  ): Promise<ApiResponseDto<[]>> {
    return this.authService.signupUser(userDto);
  }

  @Post('signin')
  async signinUser(
    @Body() userDto: SigninUserDto,
    @Res() response: Response,
  ): Promise<void> {
    return this.authService.signinUser(userDto, response);
  }

  @Post('signout')
  async signoutUser(@Res() response: Response): Promise<void> {
    return this.authService.signoutUser(response);
  }

  @Post('verify-password')
  async verifyPassword(
    @Body() verfiyDto: VerifyPasswordDto,
    @Req() req: Request,
  ): Promise<ApiResponseDto<null>> {
    return this.authService.verifyPassword(verfiyDto, req);
  }

  @ApiBearerAuth()
  @Put('user/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() usertDto: UpdateUserDto,
  ): Promise<ApiResponseDto<User | null>> {
    return this.authService.updateUser(id, usertDto);
  }

  @ApiBearerAuth()
  @Delete('user/:id')
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ): Promise<void> {
    return this.authService.deleteUser(id, response);
  }

  @Post('google')
  async signinGoogle(
    @Body() googleDto: SigninGoogleDto,
    @Res() response: Response,
  ): Promise<void> {
    return this.authService.signinGoogle(googleDto, response);
  }

  @Post('kakao')
  async signinKakao(
    @Body() kakaoDto: SigninKakaoDto,
    @Res() response: Response,
  ): Promise<void> {
    return this.authService.signinKakao(kakaoDto, response);
  }

  @Post('kakao/signup')
  async completeKakaoSignup(
    @Body() userDto: KakaoUserDto,
    @Res() response: Response,
  ): Promise<void> {
    return this.authService.completeKakaoSignup(userDto, response);
  }

  @Post('naver')
  async signinNaver(
    @Body() naverDto: SigninNaverDto,
    @Res() response: Response,
  ): Promise<void> {
    return this.authService.signinNaver(naverDto, response);
  }
}
