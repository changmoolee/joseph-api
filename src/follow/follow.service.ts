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
            id: user_id,
          },
          following: {
            id: followDto.user_id,
          },
        },
      });

      if (findFollow) {
        await this.followRepository
          .createQueryBuilder('follow')
          .delete()
          .where({
            follower: {
              id: user_id,
            },
            following: {
              id: followDto.user_id,
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
              id: user_id,
            },
            following: {
              id: followDto.user_id,
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
      /** 해당 회원이 팔로우 하고 있는 회원들 */
      const followingsData = await this.followRepository
        .createQueryBuilder('follow')
        .leftJoin('follow.follower', 'follower')
        .leftJoin('follow.following', 'following')
        .where('follower.id = :id', {
          id,
        }) // follower_id 컬럼에 작성된 user id는 팔로우를 실행한 회원
        .select(['follow.id', 'following.id']) // 데이터 조회를 위해 follow.id 를 select
        .getMany();

      const followingUsers = followingsData.map((data) => data.following.id);

      if (followingUsers.length > 0) {
        followingUsersInfo = await this.userRepository
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.posts', 'posts')
          .leftJoinAndSelect('user.followers', 'followers')
          .leftJoinAndSelect('user.followings', 'followings')
          .select([
            'user.id',
            'user.username',
            'user.image_url',
            'posts.id',
            'followers.id',
            'followings.id',
          ])
          .where('user.id IN (:...id)', { id: followingUsers })
          .getMany();
      }

      /** 해당 회원을 팔로우하고 있는 회원들 */
      const followersData = await this.followRepository
        .createQueryBuilder('follow')
        .leftJoin('follow.follower', 'follower')
        .leftJoin('follow.following', 'following')
        .where('following.id = :id', {
          id,
        }) // following_id 컬럼에 작성된 user id는 팔로우를 당한 사람
        .select(['follow.id', 'follower.id']) // 데이터 조회를 위해 follow.id 를 select
        .getMany();

      const followerUsers = followersData.map((data) => data.follower.id);

      if (followerUsers.length > 0) {
        followerUsersInfo = await this.userRepository
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.posts', 'posts')
          .leftJoinAndSelect('user.followers', 'followers')
          .leftJoinAndSelect('user.followings', 'followings')
          .select([
            'user.id',
            'user.username',
            'user.image_url',
            'posts.id',
            'followers.id',
            'followings.id',
          ])
          .where('user.id IN (:...id)', { id: followerUsers })
          .getMany();
      }

      return {
        data: {
          following: followingUsersInfo,
          follower: followerUsersInfo,
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
