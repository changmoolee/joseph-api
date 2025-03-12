import { IsNotEmpty, IsString } from 'class-validator';

export class MakePostDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  image_url: string;
}
