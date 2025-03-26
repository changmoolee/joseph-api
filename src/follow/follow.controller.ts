import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { ApiResponseDto } from 'src/common/dto/response.dto';
import { ExcuteFollowDto } from 'src/follow/dto/excute-follow.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('follow')
export class FollowController {
  constructor(private readonly likeService: FollowService) {}

  @ApiBearerAuth()
  @Post('user')
  async excuteFollow(
    @Body() followDto: ExcuteFollowDto,
    @Req() req: Request,
  ): Promise<ApiResponseDto<null>> {
    return this.likeService.excuteFollow(followDto, req);
  }

  @Get('user/:id')
  async getUserFollow(@Param('id', ParseIntPipe) id: number): Promise<
    ApiResponseDto<{
      follower: any;
      following: any;
    }>
  > {
    return this.likeService.getUserFollow(id);
  }
}
