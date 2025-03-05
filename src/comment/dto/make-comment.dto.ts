import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class MakeCommentDto {
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsNotEmpty()
  @IsNumber()
  post_id: number;

  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  parent_comment_id: number;
}
