import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/user/user.entity';
import { ApiResponseDto } from 'src/common/dto/response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('search')
  async searchUsers(
    @Query('searchWord') searchWord: string,
  ): Promise<ApiResponseDto<User[]>> {
    return this.userService.searchUsers(searchWord || '');
  }
}
