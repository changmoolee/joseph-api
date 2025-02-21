import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { ApiResponseDto } from 'src/common/dto/response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async signupUser(
    @Body() userDto: CreateUserDto,
  ): Promise<ApiResponseDto<[]>> {
    return this.authService.signupUser(userDto);
  }
}
