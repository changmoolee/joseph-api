import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('search')
  async searchUsers(@Query('searchWord') searchWord: string): Promise<any> {
    try {
      const users = await this.userService.searchUsers(searchWord || '');
      return {
        data: users,
        result: 'success',
        message: '',
      };
    } catch (error) {
      return {
        result: 'fail',
        message: error.message,
      };
    }
  }
}
