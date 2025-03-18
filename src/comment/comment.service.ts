import { ApiResponseDto } from '../common/dto/response.dto';
import {
  Body,
  Injectable,
  NotFoundException,
  Param,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { MakeCommentDto } from 'src/comment/dto/make-comment.dto';

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
        'user.deleted_at',
      ])
      .where('comment.post_id = :post_id', { post_id })
      .getMany();

    if (!findComments) {
      throw new NotFoundException(
        `post_id : ${post_id}의 댓글이 존재하지 않습니다.`,
      );
    }

    /** 탈퇴회원의 댓글 필터링 */
    const validComments = findComments.filter(
      (comment) => comment.user.deleted_at === null,
    );

    return {
      data: validComments,
      result: 'success',
      message: `post_id : ${post_id}의 댓글 조회를 성공하였습니다.`,
    };
  }

  async makeComment(
    @Param('id') id: number,
    @Body() commentDto: MakeCommentDto,
    @Req() req: Request,
  ): Promise<ApiResponseDto<null>> {
    /** jwt 미들웨어에서 넘겨준 유저 정보 */
    const userinfo = req['user'];

    const newComment = await this.commentRepository.create({
      post: { id },
      user: { id: userinfo.id },
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
  }

  async deleteComment(
    @Param('id') id: number,
    @Req() req: Request,
  ): Promise<ApiResponseDto<null>> {
    /** jwt 미들웨어에서 넘겨준 유저 정보 */
    const userinfo = req['user'];

    // 삭제할 댓글
    const findComment = await this.commentRepository.findOne({
      where: {
        id,
        user: { id: userinfo.id },
      },
    });

    // 조회된 댓글이 없을 경우 에러
    if (!findComment) {
      throw new NotFoundException('삭제할 댓글이 존재하지 않습니다.');
    }

    await this.commentRepository
      .createQueryBuilder('comment')
      .where('id = :id', { id: findComment.id })
      .delete()
      .execute();

    return {
      data: null,
      result: 'success',
      message: '댓글을 삭제하였습니다.',
    };
  }
}
