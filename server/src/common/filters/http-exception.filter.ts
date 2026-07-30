import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLoggerService } from '@logger/logger.service';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal Server Error' };

    const correlationId =
      (request.headers['x-correlation-id'] as string) ||
      `req-${Math.random().toString(36).substring(2, 9)}`;

    let message = 'An unexpected error occurred';
    let details: unknown = null;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const respObj = exceptionResponse as Record<string, unknown>;
      message = (respObj.message || respObj.error || message) as string;
      details = respObj.message !== message ? respObj.message : null;
    }

    const errorResponse = {
      statusCode: status,
      error: HttpStatus[status] || 'Error',
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId,
    };

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${status}: ${message}`,
        exception instanceof Error ? exception.stack : String(exception),
        'GlobalHttpExceptionFilter',
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} - ${status}: ${message}`,
        'GlobalHttpExceptionFilter',
      );
    }

    response.status(status).json(errorResponse);
  }
}
