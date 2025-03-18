import { IsNumber, IsOptional, IsString } from 'class-validator';

export class MakeCommentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  parent_comment_id: number;
}
