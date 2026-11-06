import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { STATUS_CODES } from 'node:http';

const BAD_REQUEST_STATUS = 400;
const INTERNAL_SERVER_ERROR_STATUS = 500;
const MAX_ERROR_STATUS = 600;
const INTERNAL_ERROR_MESSAGE = 'Internal server error';

type ErrorPayload = Record<string, unknown> & { message: unknown };

type ExceptionBody = ErrorPayload & {
  statusCode: number;
  error: string;
  path: string;
  timestamp: string;
  requestId: string;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<FastifyRequest>();
    const response = context.getResponse<FastifyReply>();

    if (response.sent || response.raw.headersSent) return;

    const status = resolveStatus(exception);
    const requestId = resolveRequestId(request);
    const path = request.url.split('?')[0];

    this.log(exception, status, requestId, { method: request.method, path });
    response.header('x-request-id', requestId);
    response.status(status).send(buildBody(exception, status, requestId, path));
  }

  private log(
    exception: unknown,
    status: number,
    requestId: string,
    requestContext: { method: string; path: string },
  ): void {
    if (status < INTERNAL_SERVER_ERROR_STATUS) return;

    const detail =
      exception instanceof Error
        ? (exception.stack ?? exception.message)
        : String(exception);

    this.logger.error(
      `${requestContext.method} ${requestContext.path} -> ${status} [${requestId}]`,
      detail,
    );
  }
}

function resolveRequestId(request: FastifyRequest): string {
  const header = request.headers['x-request-id'];

  return typeof header === 'string' && header.length > 0
    ? header
    : randomUUID();
}

function resolveStatus(exception: unknown): number {
  if (exception instanceof HttpException) return exception.getStatus();

  const statusCode = (exception as { statusCode?: unknown })?.statusCode;

  return typeof statusCode === 'number' &&
    statusCode >= BAD_REQUEST_STATUS &&
    statusCode < MAX_ERROR_STATUS
    ? statusCode
    : INTERNAL_SERVER_ERROR_STATUS;
}

function buildBody(
  exception: unknown,
  status: number,
  requestId: string,
  path: string,
): ExceptionBody {
  const payload =
    exception instanceof HttpException
      ? httpExceptionBody(exception)
      : unknownErrorBody(exception, status);

  return {
    ...payload,
    statusCode: status,
    error: STATUS_CODES[status] ?? 'Error',
    path,
    timestamp: new Date().toISOString(),
    requestId,
  };
}

function httpExceptionBody(exception: HttpException): ErrorPayload {
  if (exception.getStatus() >= INTERNAL_SERVER_ERROR_STATUS) {
    return { message: INTERNAL_ERROR_MESSAGE };
  }

  const response = exception.getResponse();

  if (typeof response === 'string') {
    return { message: response };
  }

  return isErrorPayload(response) ? response : { message: response };
}

function isErrorPayload(value: unknown): value is ErrorPayload {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unknownErrorBody(exception: unknown, status: number): ErrorPayload {
  if (status >= INTERNAL_SERVER_ERROR_STATUS) {
    return { message: INTERNAL_ERROR_MESSAGE };
  }

  return {
    message:
      exception instanceof Error
        ? exception.message
        : (STATUS_CODES[status] ?? INTERNAL_ERROR_MESSAGE),
  };
}
