import { Controller, Get, Param } from '@nestjs/common';
import { PostService } from './post.service';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import { Post } from 'src/post/post.entity';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getAllPosts(): Promise<ApiResponseDto<Post[]>> {
    return this.postService.getAllPosts();
  }

  @Get('user/:user_id')
  async getUserPosts(
    @Param('user_id') user_id: string,
  ): Promise<ApiResponseDto<Post[]>> {
    return this.postService.getUserPosts(user_id);
  }
}
