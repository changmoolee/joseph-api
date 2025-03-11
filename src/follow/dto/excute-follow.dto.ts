import { IsNotEmpty, IsNumber } from 'class-validator';

export class ExcuteFollowDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: number;
}
