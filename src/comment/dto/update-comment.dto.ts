import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsString()
  content: string;
}
