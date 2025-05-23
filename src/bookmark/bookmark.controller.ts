import { Controller, Post, Body, Req } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import { ExcuteBookMarkDto } from 'src/bookmark/dto/excute-bookmark.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('bookmark')
export class BookmarkController {
  constructor(private readonly likeService: BookmarkService) {}

  @ApiBearerAuth()
  @Post('post')
  async excuteLike(
    @Body() bookmarkDto: ExcuteBookMarkDto,
    @Req() req: Request,
  ): Promise<ApiResponseDto<[]>> {
    return this.likeService.excuteBookmark(bookmarkDto, req);
  }
}
