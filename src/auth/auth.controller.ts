import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async signupUser(@Body() userDto: CreateUserDto) {
    try {
      await this.authService.signupUser(userDto);

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
}
