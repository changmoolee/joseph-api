import { Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { ApiResponseDto } from 'src/common/dto/response.dto';

@Injectable()
export class PostService {
  constructor(
    // PostRepository를 NestJS의 DI 시스템을 통해 주입받음
    @InjectRepository(Post)
    // TypeORM의 저장소 객체
    // Post 엔티티의 데이터베이스 조작을 위한 Repository
    private postRepository: Repository<Post>,
  ) {}

  async getAllPosts(): Promise<ApiResponseDto<Post[]>> {
    try {
      const posts = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.likes', 'likes')
        .leftJoinAndSelect('post.bookmarks', 'bookmarks')
        .leftJoinAndSelect('likes.user', 'likeUser')
        .leftJoinAndSelect('bookmarks.user', 'bookmarkUser')
        .select([
          'post.id',
          'post.image_url',
          'post.description',
          'post.created_at',
          'user.id',
          'user.username',
          'user.email',
          'user.image_url',
          'likes.id',
          'likes.created_at',
          'likeUser.id',
          'likeUser.username',
          'bookmarks.id',
          'bookmarks.created_at',
          'bookmarkUser.id',
          'bookmarkUser.username',
        ])
        .getMany();

      return {
        data: posts,
        result: 'success',
        message: '게시글을 성공적으로 가져왔습니다.',
      };
    } catch (error) {
      console.error(error);

      return {
        data: [],
        result: 'failure',
        message: '게시글을 불러오는 중 오류가 발생했습니다.',
      };
    }
  }
}
