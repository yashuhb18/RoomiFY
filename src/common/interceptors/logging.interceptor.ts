import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'mfaSecret',
  'authorization',
];

function redactSensitiveData(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveData(item));
  }

  const redacted: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, ip } = request;
    const userAgent = request.get('user-agent') || 'unknown';
    const userId = request.user?.sub || 'anonymous';
    const startTime = Date.now();

    const redactedBody = body ? redactSensitiveData(body) : undefined;

    this.logger.log(
      JSON.stringify({
        event: 'REQUEST_RECEIVED',
        method,
        url,
        userId,
        ip,
        userAgent,
        body: redactedBody,
      }),
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const responseTime = Date.now() - startTime;

          this.logger.log(
            JSON.stringify({
              event: 'REQUEST_COMPLETED',
              method,
              url,
              statusCode,
              responseTime: `${responseTime}ms`,
              userId,
            }),
          );
        },
        error: (error: Error) => {
          const responseTime = Date.now() - startTime;

          this.logger.error(
            JSON.stringify({
              event: 'REQUEST_FAILED',
              method,
              url,
              responseTime: `${responseTime}ms`,
              userId,
              error: error.message,
            }),
          );
        },
      }),
    );
  }
}
