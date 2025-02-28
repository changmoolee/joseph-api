import { Controller, Post, Body } from '@nestjs/common';
import { LikeService } from './like.service';
import { ExcuteLikeDto } from 'src/like/dto/excute-like.dto';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post('post')
  async excuteLike(@Body() likeDto: ExcuteLikeDto) {
    this.likeService.excuteLike(likeDto);
  }
}
