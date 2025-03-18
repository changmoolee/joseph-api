import { Controller, Post, Body, Req } from '@nestjs/common';
import { LikeService } from './like.service';
import { ExcuteLikeDto } from 'src/like/dto/excute-like.dto';
import { ApiResponseDto } from 'src/common/dto/response.dto';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post('post')
  async excuteLike(
    @Body() likeDto: ExcuteLikeDto,
    @Req() req: Request,
  ): Promise<ApiResponseDto<[]>> {
    return this.likeService.excuteLike(likeDto, req);
  }
}
