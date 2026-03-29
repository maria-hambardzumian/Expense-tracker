import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = isHttpException ? exception.getResponse() : null;

    const body = typeof exceptionResponse === 'object' && exceptionResponse !== null
      ? (exceptionResponse as Record<string, unknown>)
      : null;

    response.status(status).json({
      success: false,
      statusCode: status,
      message: body?.message ?? exceptionResponse ?? 'Internal server error',
      error: body?.error ?? undefined,
    });
  }
}
