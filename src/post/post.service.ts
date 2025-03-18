import {
  BadRequestException,
  Body,
  Injectable,
  NotFoundException,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import { User } from 'src/user/user.entity';
import { Like } from 'src/like/like.entity';
import { Bookmark } from 'src/bookmark/bookmark.entity';
import { MakePostDto } from 'src/post/dto/make-post.dto';

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

    @InjectRepository(Like) // like Repo도 추가
    private likeRepository: Repository<Like>,

    @InjectRepository(Bookmark) // bookmark Repo도 추가
    private bookmarkRepository: Repository<Bookmark>,
  ) {}

  async getAllPosts(): Promise<ApiResponseDto<Post[]>> {
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
      .where('user.deleted_at IS NULL') // 탈퇴회원 필터링
      .getMany();

    return {
      data: posts,
      result: 'success',
      message: '게시글을 성공적으로 가져왔습니다.',
    };
  }

  async getPost(@Param('id') id: number): Promise<ApiResponseDto<Post>> {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('post.bookmarks', 'bookmarks')
      .leftJoinAndSelect('likes.user', 'likeUser')
      .leftJoinAndSelect('bookmarks.user', 'bookmarkUser')
      .where('post.id = :id', { id })
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

    if (!post) {
      throw new NotFoundException('게시글이 존재하지 않습니다.');
    }

    return {
      data: post,
      result: 'success',
      message: '게시글을 성공적으로 가져왔습니다.',
    };
  }

  async getUserPosts(
    @Param('user_id') user_id: number,
    @Query('type') type: string,
  ): Promise<ApiResponseDto<Post[]>> {
    const findUser = await this.userRepository.findOne({
      where: { id: user_id },
    });

    /** 회원의 탈퇴 여부 */
    const isValidUser = findUser.deleted_at === null;

    if (!isValidUser) {
      throw new BadRequestException('이미 탈퇴한 회원입니다.');
    }

    let posts;

    if (type === 'liked') {
      const likePosts = await this.likeRepository
        .createQueryBuilder('like')
        .leftJoinAndSelect('like.post', 'post')
        .leftJoinAndSelect('post.user', 'postUser')
        .select([
          'like.id',
          'post.id',
          'post.image_url',
          'post.description',
          'post.created_at',
          'postUser.id',
          'postUser.deleted_at',
        ])
        .where('like.user_id = :user_id', { user_id })
        .getMany();

      /** 탈퇴회원 필터링 */
      const filteredLikePosts = likePosts.filter(
        (bookmark) => bookmark.post?.user !== null,
      );

      posts = filteredLikePosts.map((bookmark) => bookmark.post);
    } else if (type === 'saved') {
      const bookmarksPosts = await this.bookmarkRepository
        .createQueryBuilder('bookmark')
        .leftJoinAndSelect('bookmark.post', 'post')
        .leftJoinAndSelect('post.user', 'postUser')
        .select([
          'bookmark.id',
          'post.id',
          'post.image_url',
          'post.description',
          'post.created_at',
          'postUser.id',
          'postUser.deleted_at',
        ])
        .where('bookmark.user_id = :user_id', { user_id })
        .getMany();

      /** 탈퇴회원 필터링 */
      const filteredBookmarks = bookmarksPosts.filter(
        (bookmark) => bookmark.post?.user !== null,
      );

      posts = filteredBookmarks.map((bookmark) => bookmark.post);
    } else {
      posts = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .select([
          'post.id',
          'post.image_url',
          'post.description',
          'post.created_at',
        ])
        .where('post.user_id = :user_id', { user_id })
        .andWhere('user.deleted_at IS NULL')
        .getMany();
    }

    return {
      data: posts,
      result: 'success',
      message: '게시글을 성공적으로 가져왔습니다.',
    };
  }

  async makePost(
    @Req() req: Request,
    @Body() postDto: MakePostDto,
  ): Promise<ApiResponseDto<null>> {
    /** jwt 미들웨어에서 넘겨준 유저 정보 */
    const userinfo = req['user'];

    await this.postRepository
      .createQueryBuilder('post')
      .insert()
      .into(Post)
      .values({
        user: { id: userinfo.id },
        image_url: postDto.image_url,
        description: postDto.description,
      })
      .execute();

    return {
      data: null,
      result: 'success',
      message: '게시글을 생성하였습니다.',
    };
  }

  async updatePost(
    @Req() req: Request,
    @Param('id') id: number,
    @Body() postDto: MakePostDto,
  ): Promise<ApiResponseDto<null>> {
    /** jwt 미들웨어에서 넘겨준 유저 정보 */
    const userinfo = req['user'];

    const findPost = await this.postRepository.findOne({
      where: { id, user: { id: userinfo.id } },
    });

    if (!findPost) {
      throw new NotFoundException(
        `post_id: ${id} 수정할 게시글이 존재하지 않습니다.`,
      );
    }

    await this.postRepository
      .createQueryBuilder('post')
      .where('id = :id', { id: findPost.id })
      .update({
        image_url: postDto.image_url,
        description: postDto.description,
      })
      .execute();

    return {
      data: null,
      result: 'success',
      message: `post_id: ${findPost.id} 게시글을 수정하였습니다.`,
    };
  }

  async deletePost(
    @Req() req: Request,
    @Param('id') id: number,
  ): Promise<ApiResponseDto<null>> {
    /** jwt 미들웨어에서 넘겨준 유저 정보 */
    const userinfo = req['user'];

    const findPost = await this.postRepository.findOne({
      where: { id, user: { id: userinfo.id } },
    });

    if (!findPost) {
      throw new NotFoundException(
        `post_id: ${id} 삭제할 게시물이 존재하지 않습니다.`,
      );
    }

    await this.postRepository
      .createQueryBuilder('post')
      .where('id = :id', { id: findPost.id })
      .delete()
      .execute();

    return {
      data: null,
      result: 'success',
      message: `post_id: ${findPost.id} 게시글을 삭제하였습니다.`,
    };
  }
}
