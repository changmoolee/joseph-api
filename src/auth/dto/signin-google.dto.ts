import { IsNotEmpty, IsString } from 'class-validator';

export class SigninGoogleDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
