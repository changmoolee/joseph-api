import { Controller, Get, Post, Param, Query, Req, Body } from '@nestjs/common';
import { PostService } from './post.service';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import { Post as PostEntity } from 'src/post/post.entity';
import { MakePostDto } from 'src/post/dto/make-post.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getAllPosts(): Promise<ApiResponseDto<PostEntity[]>> {
    return this.postService.getAllPosts();
  }

  @Get(':id')
  async getPost(@Param('id') id: string): Promise<ApiResponseDto<PostEntity>> {
    return this.postService.getPost(id);
  }

  @Get('user/:user_id')
  async getUserPosts(
    @Param('user_id') user_id: string,
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
}
