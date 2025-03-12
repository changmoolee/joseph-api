import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // 클라이언트 token 쿠키
    const jwt = req.cookies.token;

    if (!jwt) {
      res.status(401).json({
        data: null,
        result: 'failure',
        message: '쿠키가 존재하지 않습니다.',
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET || '';

    const secret = new TextEncoder().encode(JWT_SECRET);

    try {
      const { payload } = await jose.jwtVerify(jwt, secret);

      req['user'] = payload;

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({
        data: null,
        result: 'failure',
        message: '인증되지 않는 쿠키입니다.',
      });
    }
  }
}
