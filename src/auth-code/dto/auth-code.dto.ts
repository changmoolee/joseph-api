import { IsNotEmpty, IsString } from 'class-validator';

export class SendAuthCodeDto {
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class VerifyAuthCodeDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}
