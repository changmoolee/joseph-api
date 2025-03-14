import { ApiResponseDto } from './../common/dto/response.dto';
import { Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      const findUser = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.posts', 'posts')
        .leftJoinAndSelect('user.followers', 'followers')
        .leftJoinAndSelect('followers.follower', 'followerUser')
        .leftJoinAndSelect('user.followings', 'followings')
        .leftJoinAndSelect('followings.following', 'followingUser')
        .select([
          'user.id',
          'user.username',
          'user.image_url',
          'posts.id',
          'followers.id', // 팔로워 id
          'followerUser.id',
          'followings.id', // 팔로잉 id
          'followingUser.id',
        ])
        .where('user.id = :id', { id })
        .getOne();

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
        const users = await this.userRepository
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.followers', 'followers')
          .leftJoinAndSelect('user.followings', 'followings')
          .select([
            'user.id',
            'user.username',
            'user.image_url',
            'followers.id',
            'followings.id',
          ])
          .take(10)
          .getMany();

        return {
          data: users,
          result: 'success',
          message: '회원 검색을 성공하였습니다.',
        };
      }

      const findUsers = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.followers', 'followers')
        .leftJoinAndSelect('user.followings', 'followings')
        .select([
          'user.id',
          'user.username',
          'user.image_url',
          'followers.id',
          'followings.id',
        ])
        .where('user.username LIKE :username', { username: `%${text}%` })
        .orWhere('user.email LIKE :email', { email: `%${text}%` })
        .take(10)
        .getMany();

      return {
        data: findUsers,
        result: 'success',
        message: '회원 검색을 성공하였습니다.',
      };
    } catch (error) {
      console.error(error);
      return {
        data: [],
        result: 'failure',
        message: '회원 검색을 실패하였습니다.',
      };
    }
  }
}
