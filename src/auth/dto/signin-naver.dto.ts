import { IsNotEmpty, IsString } from 'class-validator';

export class SigninNaverDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  state: string;
}
