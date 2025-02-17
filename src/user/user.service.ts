import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async searchUsers(searchWord: string): Promise<User[]> {
    if (!searchWord) {
      // 검색어가 없으면 전체 데이터를 가져오되, LIMIT 10 적용
      return this.userRepository.find({
        take: 10, // 최대 10개 제한
      });
    }

    return this.userRepository.find({
      where: [
        { username: Like(`%${searchWord}%`) },
        { email: Like(`%${searchWord}%`) },
      ],
      take: 10, // LIMIT 10
    });
  }
}
