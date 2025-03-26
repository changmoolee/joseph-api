import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import { MakeCommentDto } from 'src/comment/dto/make-comment.dto';
import { Comment } from 'src/comment/comment.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('post/:id')
  async getComments(
    @Param('id', ParseIntPipe) post_id: number,
  ): Promise<ApiResponseDto<Comment[]>> {
    return this.commentService.getComments(post_id);
  }

  @ApiBearerAuth()
  @Post('post/:id')
  async makeComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() commentDto: MakeCommentDto,
    @Req() req: Request,
  ): Promise<ApiResponseDto<null>> {
    return this.commentService.makeComment(id, commentDto, req);
  }

  @ApiBearerAuth()
  @Delete('post/:id')
  async deleteComment(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<ApiResponseDto<null>> {
    return this.commentService.deleteComment(id, req);
  }
}
