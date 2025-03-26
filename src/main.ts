import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from 'src/common/filters/global-exception.filter';
import * as crypto from 'crypto';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

if (!globalThis.crypto) {
  //@ts-expect-error: globalThis.crypto is not typed in Node.js by default
  globalThis.crypto = crypto;
}

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

  app.useGlobalFilters(new GlobalExceptionFilter());

  /** swagger 도입 */
  const config = new DocumentBuilder()
    .setTitle('joseph-api')
    .setDescription('joseph-instagram 에 백엔드 기능을 제공합니다.')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
