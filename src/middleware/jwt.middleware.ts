import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // 클라이언트 token
    const authorizationHeader = req.headers['authorization'] as string;

    const jwt = authorizationHeader?.startsWith('Bearer ')
      ? authorizationHeader.split(' ')[1]
      : null;

    if (!jwt) {
      throw new UnauthorizedException('토큰이 존재하지 않습니다.');
    }

    const JWT_SECRET = process.env.JWT_SECRET || '';

    const secret = new TextEncoder().encode(JWT_SECRET);

    try {
      const { payload } = await jose.jwtVerify(jwt, secret);

      req['user'] = payload;

      next();
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('인증되지 않는 토큰입니다.');
    }
  }
}
