import { IsNotEmpty, IsNumber } from 'class-validator';

export class ExcuteLikeDto {
  @IsNotEmpty()
  @IsNumber()
  post_id: number;
}
