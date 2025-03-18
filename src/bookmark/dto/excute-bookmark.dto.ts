import { IsNotEmpty, IsNumber } from 'class-validator';

export class ExcuteBookMarkDto {
  @IsNotEmpty()
  @IsNumber()
  post_id: number;
}
