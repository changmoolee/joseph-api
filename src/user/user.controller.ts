import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/user/user.entity';
import { ApiResponseDto } from 'src/common/dto/response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<ApiResponseDto<User[]>> {
    return this.userService.getAllUsers();
  }

  @Get('search')
  async searchUsers(
    @Query('text') text: string,
  ): Promise<ApiResponseDto<User[]>> {
    return this.userService.searchUsers(text || '');
  }

  @Get(':id')
  async getUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<User>> {
    return this.userService.getUser(id);
  }
}
