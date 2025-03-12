import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 허용된 도메인
  const allowedOrigins =
    process.env.NODE_ENV === 'development'
      ? process.env.DEVELOPMENT.split(',')
      : process.env.JOSEPH_INSTAGRAM.split(',');

  // cookie-parser
  app.use(cookieParser());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true, // 쿠키 허용
  });

  // 전역 유효성 검사 활성화 (DTO 적용) 참조 : https://docs.nestjs.com/techniques/validation
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
