import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTPMiddleware');

  use(req: Request, _res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || 'unknown';

    this.logger.log(
      `[${method}] ${originalUrl} — IP: ${ip} — UA: ${userAgent}`,
    );

    next();
  }
}
