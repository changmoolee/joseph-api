import { IsNotEmpty, IsNumber } from 'class-validator';

export class ExcuteLikeDto {
  // 주석 예시
  /**
   * @description 게시물 id
   * @example 1
   */
  @IsNotEmpty()
  @IsNumber()
  post_id: number;
}
