import { ApiResponseDto } from './../common/dto/response.dto';
import { Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    // UserRepository를 NestJS의 DI 시스템을 통해 주입받음
    @InjectRepository(User)
    // TypeORM의 저장소 객체
    // User 엔티티의 데이터베이스 조작을 위한 Repository
    private userRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<ApiResponseDto<User[]>> {
    try {
      const users = await this.userRepository.find();

      return {
        data: users,
        result: 'success',
        message: '유저 데이터 호출 완료',
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

  async getUser(@Param('id') id: string): Promise<ApiResponseDto<User>> {
    try {
      const findUser = await this.userRepository.findOne({
        where: { id: parseInt(id) },
      });

      if (!findUser) {
        return {
          data: null,
          result: 'failure',
          message: '회원 데이터를 찾지 못했습니다.',
        };
      }

      return {
        data: findUser,
        result: 'success',
        message: '회원 데이터 호출 완료',
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

  async searchUsers(text: string): Promise<ApiResponseDto<User[]>> {
    try {
      if (!text) {
        // 검색어가 없으면 전체 데이터를 가져오되, LIMIT 10 적용
        const users = await this.userRepository.find({
          take: 10, // 최대 10개 제한
        });

        return {
          data: users,
          result: 'success',
          message: '',
        };
      }

      const findUsers = await this.userRepository.find({
        where: [{ username: Like(`%${text}%`) }, { email: Like(`%${text}%`) }],
        take: 10,
      });

      return {
        data: findUsers,
        result: 'success',
        message: '',
      };
    } catch (error) {
      return {
        data: [],
        result: 'failure',
        message: error.message,
      };
    }
  }
}
