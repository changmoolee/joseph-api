import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class SigninKakaoDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class KakaoUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  image_url: string;

  @IsNotEmpty()
  @IsString()
  provider_id: string;
}
