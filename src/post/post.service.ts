import { Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import { User } from 'src/user/user.entity';

@Injectable()
export class PostService {
  constructor(
    // PostRepository를 NestJS의 DI 시스템을 통해 주입받음
    @InjectRepository(Post)
    // TypeORM의 저장소 객체
    // Post 엔티티의 데이터베이스 조작을 위한 Repository
    private postRepository: Repository<Post>,

    @InjectRepository(User) // user Repo도 추가
    private userRepository: Repository<User>,
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
          'user.deleted_at',
          'likes.id',
          'likes.created_at',
          'likeUser.id',
          'likeUser.username',
          'likeUser.deleted_at',
          'bookmarks.id',
          'bookmarks.created_at',
          'bookmarkUser.id',
          'bookmarkUser.username',
          'bookmarkUser.deleted_at',
        ])
        .getMany();

      // 탈퇴회원의 게시물 제외
      const validUserPosts = posts.filter(
        (post) => post.user.deleted_at === null,
      );

      // 탈퇴회원의 좋아요, 북마크 제외
      const validLikeBookmarkPosts = validUserPosts.map((post) => ({
        ...post,
        likes: post.likes.filter(
          (like) => like.user && like.user.deleted_at === null,
        ),
        bookmarks: post.bookmarks.filter(
          (bookmark) => bookmark.user && bookmark.user.deleted_at === null,
        ),
      }));

      return {
        data: validLikeBookmarkPosts,
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

  async getPost(@Param('id') id: string): Promise<ApiResponseDto<Post>> {
    try {
      const post = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.likes', 'likes')
        .leftJoinAndSelect('post.bookmarks', 'bookmarks')
        .leftJoinAndSelect('likes.user', 'likeUser')
        .leftJoinAndSelect('bookmarks.user', 'bookmarkUser')
        .where('post.id = :id', { id: parseInt(id) })
        .andWhere('user.deleted_at IS NULL')
        .select([
          'post.id',
          'post.image_url',
          'post.description',
          'post.created_at',
          'user.id',
          'user.username',
          'user.email',
          'user.image_url',
          'user.deleted_at',
          'likes.id',
          'likes.created_at',
          'likeUser.id',
          'likeUser.username',
          'likeUser.deleted_at',
          'bookmarks.id',
          'bookmarks.created_at',
          'bookmarkUser.id',
          'bookmarkUser.username',
          'bookmarkUser.deleted_at',
        ])
        .getOne();

      return {
        data: post,
        result: 'success',
        message: '게시글을 성공적으로 가져왔습니다.',
      };
    } catch (error) {
      console.error(error);

      return {
        data: null,
        result: 'failure',
        message: '게시글을 불러오는 중 오류가 발생했습니다.',
      };
    }
  }

  async getUserPosts(
    @Param('user_id') user_id: string,
  ): Promise<ApiResponseDto<Post[]>> {
    try {
      const findUser = await this.userRepository.findOne({
        where: { id: parseInt(user_id) },
      });

      /** 회원의 탈퇴 여부 */
      const isValidUser = findUser.deleted_at === null;

      if (!isValidUser) {
        return {
          data: [],
          result: 'failure',
          message: '이미 탈퇴한 회원입니다.',
        };
      }

      const posts = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.likes', 'likes')
        .leftJoinAndSelect('post.bookmarks', 'bookmarks')
        .leftJoinAndSelect('likes.post', 'likesPost')
        .leftJoinAndSelect('likes.user', 'likesUser')
        .leftJoinAndSelect('bookmarks.post', 'bookmarksPost')
        .leftJoinAndSelect('bookmarks.user', 'bookmarksUser')
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
          'likesPost.id',
          'likesUser.id',
          'bookmarks.id',
          'bookmarks.created_at',
          'bookmarksPost.id',
          'bookmarksUser.id',
        ])
        .where('post.user_id = :user_id', { user_id })
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
