import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Req,
  Body,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import { Post as PostEntity } from 'src/post/post.entity';
import { MakePostDto } from 'src/post/dto/make-post.dto';
import { UpdatePostDto } from 'src/post/dto/update-post.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getAllPosts(
    @Query('take', ParseIntPipe) take: number,
    @Query('cursor') cursor: string,
  ): Promise<PostEntity[]> {
    return this.postService.getAllPosts(take, cursor);
  }

  @Get(':id')
  async getPost(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<PostEntity>> {
    return this.postService.getPost(id);
  }

  @Get('user/:user_id')
  async getUserPosts(
    @Param('user_id', ParseIntPipe) user_id: number,
    @Query('type') type: string,
  ): Promise<ApiResponseDto<PostEntity[]>> {
    return this.postService.getUserPosts(user_id, type);
  }

  @Post()
  async makePost(
    @Req() req: Request,
    @Body() postDto: MakePostDto,
  ): Promise<ApiResponseDto<null>> {
    return this.postService.makePost(req, postDto);
  }

  @Put(':id')
  async updatePost(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() postDto: UpdatePostDto,
  ): Promise<ApiResponseDto<null>> {
    return this.postService.updatePost(req, id, postDto);
  }

  @Delete(':id')
  async deletePost(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<null>> {
    return this.postService.deletePost(req, id);
  }
}
