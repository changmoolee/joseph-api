import { Controller, Post, Body } from '@nestjs/common';
import { LikeService } from './like.service';
import { ExcuteLikeDto } from 'src/like/dto/excute-like.dto';
import { ApiResponseDto } from 'src/common/dto/response.dto';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post('post')
  async excuteLike(
    @Body() likeDto: ExcuteLikeDto,
  ): Promise<ApiResponseDto<[]>> {
    return this.likeService.excuteLike(likeDto);
  }
}
