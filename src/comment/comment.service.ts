import { ApiResponseDto } from '../common/dto/response.dto';
import { Body, Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { MakeCommentDto } from 'src/comment/dto/make-comment.dto';
import { UpdateCommentDto } from 'src/comment/dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    // CommentRepository를 NestJS의 DI 시스템을 통해 주입받음
    @InjectRepository(Comment)
    // TypeORM의 저장소 객체
    private commentRepository: Repository<Comment>,
  ) {}

  async getComments(
    @Param('id') post_id: number,
  ): Promise<ApiResponseDto<Comment[]>> {
    try {
      const findComments = await this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .select([
          'comment.id',
          'comment.content',
          'comment.created_at',
          'comment.updated_at',
          'comment.parent_comment_id',
          'user.id',
          'user.username',
          'user.email',
          'user.image_url',
        ])
        .where('comment.post_id = :post_id', { post_id })
        .getMany();

      if (!findComments) {
        return {
          data: [],
          result: 'success',
          message: `post_id : ${post_id}의 댓글이 존재하지 않습니다.`,
        };
      }

      return {
        data: findComments,
        result: 'success',
        message: `post_id : ${post_id}의 댓글 조회를 성공하였습니다.`,
      };
    } catch (error) {
      console.error(error);
      return {
        data: [],
        result: 'failure',
        message: `post_id : ${post_id}의 댓글 조회를 실패하였습니다.`,
      };
    }
  }

  async makeComment(
    @Body() commentDto: MakeCommentDto,
  ): Promise<ApiResponseDto<null>> {
    try {
      const newComment = await this.commentRepository.create({
        user: { id: commentDto.user_id },
        post: { id: commentDto.post_id },
        content: commentDto.content,
        ...(commentDto.parent_comment_id && {
          parent_comment_id: commentDto.parent_comment_id,
        }),
      });

      await this.commentRepository.save(newComment);

      return {
        data: null,
        result: 'success',
        message: '댓글을 생성하였습니다.',
      };
    } catch (error) {
      console.error(error);
      return {
        data: null,
        result: 'failure',
        message: '댓글 생성을 실패하였습니다.',
      };
    }
  }

  async updateComment(
    @Body() commentDto: UpdateCommentDto,
  ): Promise<ApiResponseDto<null>> {
    try {
      // 수정할 댓글
      const findComment = await this.commentRepository.findOne({
        where: {
          id: commentDto.id,
        },
      });

      // 댓글 id가 없을 경우 에러
      if (!findComment) {
        return {
          data: null,
          result: 'failure',
          message: '수정할 댓글 id가 존재하지 않습니다.',
        };
      }

      findComment.content = commentDto.content;

      await this.commentRepository.save(findComment);

      return {
        data: null,
        result: 'success',
        message: '댓글을 수정하였습니다.',
      };
    } catch (error) {
      console.error(error);
      return {
        data: null,
        result: 'failure',
        message: '댓글 수정을 실패하였습니다.',
      };
    }
  }
}
