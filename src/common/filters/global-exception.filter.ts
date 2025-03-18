import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name, {
    timestamp: true,
  });

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let message = '예상치 못한 서버 오류가 발생했습니다.';

    // NestJS의 기본 HTTP exception인지 확인 (ex) NotFoundException, BadRequestException)
    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message;
    }

    // 에러 로깅
    this.logger.error(
      `📌 [${request.method}] ${request.url} 요청 중 에러 발생`,
    );

    response.status(status).json({
      data: null,
      result: 'failure',
      message,
    });
  }
}
