import { ApiResponseDto } from '../common/dto/response.dto';
import { Body, Injectable, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './like.entity';
import { ExcuteLikeDto } from 'src/like/dto/excute-like.dto';

@Injectable()
export class LikeService {
  constructor(
    // UserRepository를 NestJS의 DI 시스템을 통해 주입받음
    @InjectRepository(Like)
    // TypeORM의 저장소 객체
    // User 엔티티의 데이터베이스 조작을 위한 Repository
    private likeRepository: Repository<Like>,
  ) {}

  async excuteLike(
    @Body() likeDto: ExcuteLikeDto,
    @Req() req: Request,
  ): Promise<ApiResponseDto<[]>> {
    /** jwt 토큰 - 로그인한 회원의 id */
    const user_id = req['user'].id;

    const findLike = await this.likeRepository.findOne({
      where: {
        user: { id: user_id },
        post: { id: likeDto.post_id },
      },
    });

    if (findLike) {
      await this.likeRepository
        .createQueryBuilder()
        .delete()
        .from(Like)
        .where({
          id: findLike.id,
        })
        .execute();

      return {
        data: [],
        result: 'success',
        message: '좋아요를 해제하였습니다.',
      };
    } else {
      await this.likeRepository
        .createQueryBuilder()
        .insert()
        .into(Like)
        .values({
          user: { id: likeDto.user_id },
          post: { id: likeDto.post_id },
        })
        .execute();

      return {
        data: [],
        result: 'success',
        message: '좋아요를 실행하였습니다.',
      };
    }
  }
}
