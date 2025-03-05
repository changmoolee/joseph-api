import { IsNotEmpty, IsNumber } from 'class-validator';

export class ExcuteBookMarkDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsNotEmpty()
  @IsNumber()
  post_id: number;
}
