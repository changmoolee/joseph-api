import { ApiResponseDto } from '../common/dto/response.dto';
import { Body, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from './bookmark.entity';
import { ExcuteBookMarkDto } from 'src/bookmark/dto/excute-bookmark.dto';

@Injectable()
export class BookmarkService {
  constructor(
    // UserRepository를 NestJS의 DI 시스템을 통해 주입받음
    @InjectRepository(Bookmark)
    // TypeORM의 저장소 객체
    // User 엔티티의 데이터베이스 조작을 위한 Repository
    private bookmarkRepository: Repository<Bookmark>,
  ) {}

  async excuteBookmark(
    @Body() bookmarkDto: ExcuteBookMarkDto,
  ): Promise<ApiResponseDto<[]>> {
    try {
      const findLike = await this.bookmarkRepository.findOne({
        where: {
          user: { id: bookmarkDto.user_id },
          post: { id: bookmarkDto.post_id },
        },
      });

      if (findLike) {
        await this.bookmarkRepository
          .createQueryBuilder()
          .delete()
          .from(Bookmark)
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
        await this.bookmarkRepository
          .createQueryBuilder()
          .insert()
          .into(Bookmark)
          .values({
            user: { id: bookmarkDto.user_id },
            post: { id: bookmarkDto.post_id },
          })
          .execute();

        return {
          data: [],
          result: 'success',
          message: '좋아요를 실행하였습니다.',
        };
      }
    } catch (error) {
      console.error(error);
      return {
        data: [],
        result: 'failure',
        message: '좋아요 실행을 실패하였습니다.',
      };
    }
  }
}
