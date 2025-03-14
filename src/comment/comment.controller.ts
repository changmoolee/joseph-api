import { Controller, Post, Body, Put, Get, Param } from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import { MakeCommentDto } from 'src/comment/dto/make-comment.dto';
import { UpdateCommentDto } from 'src/comment/dto/update-comment.dto';
import { Comment } from 'src/comment/comment.entity';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('post/:id')
  async getComments(
    @Param('id') post_id: number,
  ): Promise<ApiResponseDto<Comment[]>> {
    return this.commentService.getComments(post_id);
  }

  @Post('post')
  async makeComment(
    @Body() commentDto: MakeCommentDto,
  ): Promise<ApiResponseDto<null>> {
    return this.commentService.makeComment(commentDto);
  }

  @Delete('post/:id')
  async deleteComment(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ApiResponseDto<null>> {
    return this.commentService.deleteComment(id, req);
  }
}
