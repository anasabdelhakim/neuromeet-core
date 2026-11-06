import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { AllExceptionsFilter } from './all-exceptions.filter';

type ErrorResponse = {
  statusCode: number;
  message: unknown;
  error: string;
  path: string;
  timestamp: string;
  requestId: string;
};

@Controller('probe')
class FilterProbeController {
  @Get('validation')
  rejectValidation(): never {
    throw new BadRequestException([
      'email must be an email',
      'password is too short',
    ]);
  }

  @Get('unexpected')
  throwUnexpected(): never {
    throw new Error('database password leaked');
  }

  @Get('array-payload')
  throwArrayPayload(): never {
    throw new HttpException(['one', 'two'], 400);
  }
}

describe('AllExceptionsFilter', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [FilterProbeController],
      providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('keeps validation messages in a 400 response', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/probe/validation',
    });
    const body = response.json<ErrorResponse>();

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
      message: ['email must be an email', 'password is too short'],
      error: 'Bad Request',
      path: '/probe/validation',
    });
    expect(body.requestId).toBe(response.headers['x-request-id']);
    expect(body.timestamp).toEqual(expect.any(String));
  });

  it('hides internal details for unexpected errors', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/probe/unexpected',
    });
    const body = response.json<ErrorResponse>();

    expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body).toMatchObject({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
      path: '/probe/unexpected',
    });
    expect(JSON.stringify(body)).not.toContain('database password leaked');
    expect(body.requestId).toBe(response.headers['x-request-id']);
  });

  it('wraps a non-object payload into the message field', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/probe/array-payload',
    });
    const body = response.json<ErrorResponse>();

    expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
      message: ['one', 'two'],
      error: 'Bad Request',
      path: '/probe/array-payload',
    });
    expect(body).not.toHaveProperty('0');
  });

  it('reuses an incoming x-request-id for correlation', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/probe/unexpected',
      headers: { 'x-request-id': 'correlation-123' },
    });
    const body = response.json<ErrorResponse>();

    expect(body.requestId).toBe('correlation-123');
    expect(response.headers['x-request-id']).toBe('correlation-123');
  });
});
