import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import { SigninUserDto } from 'src/auth/dto/signin-user.dto';
import { Response } from 'express';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';
import { User } from 'src/user/user.entity';

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

  @Put('user/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() usertDto: UpdateUserDto,
  ): Promise<ApiResponseDto<User | null>> {
    return this.authService.updateUser(id, usertDto);
  }

  @Delete('user/:id')
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<null>> {
    return this.authService.deleteUser(id);
  }
}
