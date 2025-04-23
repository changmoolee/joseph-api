import { IsNotEmpty, IsString } from 'class-validator';

export class SendAuthCodeDto {
  @IsNotEmpty()
  @IsString()
  email: string;
}
