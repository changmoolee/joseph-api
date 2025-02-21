import { ApiResponseDto } from './../common/dto/response.dto';
import { Injectable } from '@nestjs/common';
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

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async searchUsers(searchWord: string): Promise<ApiResponseDto<User[]>> {
    try {
      if (!searchWord) {
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

      const users = await this.userRepository.find({
        where: [
          { username: Like(`%${searchWord}%`) },
          { email: Like(`%${searchWord}%`) },
        ],
        take: 10, // LIMIT 10
      });

      return {
        data: users,
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
