import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number;
    let message: string | string[];
    let error: string;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, any>;
        message = resp.message || exception.message;
        error = resp.error || exception.name;
      } else {
        message = exception.message;
        error = exception.name;
      }
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred. Please try again later.';
      error = 'Internal Server Error';
    }

    // Log the full error with stack trace (server-side only)
    this.logger.error(
      JSON.stringify({
        statusCode,
        path: request.url,
        method: request.method,
        message,
        timestamp: new Date().toISOString(),
        // Only include stack trace in logs, never in response
        stack:
          exception instanceof Error
            ? exception.stack
            : 'No stack trace available',
        userId: (request as any).user?.sub || 'anonymous',
        ip: request.ip,
      }),
    );

    const responseBody: ErrorResponse = {
      statusCode,
      message,
      error,
    };

    response.status(statusCode).json(responseBody);
  }
}
