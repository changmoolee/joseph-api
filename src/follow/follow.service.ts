import { ApiResponseDto } from '../common/dto/response.dto';
import { Body, Injectable, Param, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './follow.entity';
import { ExcuteFollowDto } from 'src/follow/dto/excute-follow.dto';
import { User } from 'src/user/user.entity';

@Injectable()
export class FollowService {
  constructor(
    // UserRepository를 NestJS의 DI 시스템을 통해 주입받음
    @InjectRepository(Follow)
    // TypeORM의 저장소 객체
    private followRepository: Repository<Follow>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async excuteFollow(
    @Body() followDto: ExcuteFollowDto,
    @Req() req: Request,
  ): Promise<ApiResponseDto<null>> {
    /** jwt 토큰 - 로그인한 회원의 id */
    const user_id = req['user'].id;

    try {
      const findFollow = await this.followRepository.findOne({
        where: {
          follower: {
            id: followDto.user_id,
          },
          following: {
            id: user_id,
          },
        },
      });

      if (findFollow) {
        await this.followRepository
          .createQueryBuilder('follow')
          .delete()
          .where({
            follower: {
              id: followDto.user_id,
            },
            following: {
              id: user_id,
            },
          })
          .execute();

        return {
          data: null,
          result: 'success',
          message: '팔로우를 해제하였습니다.',
        };
      } else {
        await this.followRepository
          .createQueryBuilder('follow')
          .insert()
          .values({
            follower: {
              id: followDto.user_id,
            },
            following: {
              id: user_id,
            },
          })
          .execute();

        return {
          data: null,
          result: 'success',
          message: '팔로우를 실행하였습니다.',
        };
      }
    } catch (error) {
      console.error(error);
      return {
        data: null,
        result: 'failure',
        message: '팔로우 실행을 실패하였습니다.',
      };
    }
  }

  async getUserFollow(@Param(':id') id: string): Promise<
    ApiResponseDto<{
      follower: any;
      following: any;
    }>
  > {
    /** 팔로워 회원정보 */
    let followerUsersInfo = [],
      /** 팔로잉 회원정보 */
      followingUsersInfo = [];

    try {
      /** 해당 회원을 팔로우 하고 있는 회원들 */
      const followers = await this.followRepository
        .createQueryBuilder('follow')
        .leftJoin('follow.follower', 'follower')
        .leftJoin('follow.following', 'following')
        .where('follower.id = :id', {
          id,
        })
        .select(['follow.id', 'following.id'])
        .getMany();

      const followerUsers = followers.map((follower) => follower.following.id);

      if (followerUsers.length > 0) {
        followerUsersInfo = await this.userRepository
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.posts', 'posts')
          .leftJoinAndSelect('user.follower', 'follower')
          .leftJoinAndSelect('user.following', 'following')
          .select([
            'user.id',
            'user.username',
            'user.image_url',
            'posts.id',
            'follower.id',
            'following.id',
          ])
          .where('user.id IN (:...id)', { id: followerUsers })
          .getMany();
      }

      /** 해당 회원이 팔로잉하고 있는 회원들 */
      const followings = await this.followRepository
        .createQueryBuilder('follow')
        .leftJoin('follow.follower', 'follower')
        .leftJoin('follow.following', 'following')
        .where('following.id = :id', {
          id,
        })
        .select(['follow.id', 'follower.id'])
        .getMany();

      const followingUsers = followings.map(
        (following) => following.follower.id,
      );

      if (followingUsers.length > 0) {
        followingUsersInfo = await this.userRepository
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.posts', 'posts')
          .leftJoinAndSelect('user.follower', 'follower')
          .leftJoinAndSelect('user.following', 'following')
          .select([
            'user.id',
            'user.username',
            'user.image_url',
            'posts.id',
            'follower.id',
            'following.id',
          ])
          .where('user.id IN (:...id)', { id: followingUsers })
          .getMany();
      }

      return {
        data: {
          follower: followerUsersInfo,
          following: followingUsersInfo,
        },
        result: 'success',
        message: '',
      };
    } catch (error) {
      console.error(error);
      return {
        data: null,
        result: 'failure',
        message: '',
      };
    }
  }
}
