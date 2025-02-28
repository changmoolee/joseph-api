import { IsNotEmpty, IsNumber } from 'class-validator';

export class ExcuteLikeDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsNotEmpty()
  @IsNumber()
  post_id: number;
}
