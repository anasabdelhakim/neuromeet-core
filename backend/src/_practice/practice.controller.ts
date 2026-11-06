import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  Ip,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { PracticeService } from './practice.service';
import { AuthGuard } from '../common/guards/auth.guard';

/**
 * PRACTICE CONTROLLER
 * ────────────────────
 * Base URL: http://localhost:4000/api/v1/practice
 *
 * ADD YOUR OWN ROUTES BELOW.
 * Each method here is one HTTP endpoint.
 *
 * PATTERN TO COPY:
 * ┌─────────────────────────────────────────────────────────┐
 * │  @Get('some-path')           ← the URL segment          │
 * │  @UseGuards(AuthGuard)       ← require login (optional) │
 * │  myMethod(@Param('id') id: string) {                    │
 * │    return this.practiceService.doSomething(id);         │
 * │  }                                                      │
 * └─────────────────────────────────────────────────────────┘
 */
@Controller('practice')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  // ─── Example 1: Public endpoint, no auth needed ──────────────────────────
  // Try it: GET http://localhost:4000/api/v1/practice/hello
  @Get('hello')
  hello() {
    return { message: 'Practice endpoint is working!' };
  }

  // ─── Example 2: Protected endpoint — requires a valid JWT ─────────────────
  // Try it: GET http://localhost:4000/api/v1/practice/me
  //         (with Authorization: Bearer <your_token> header)
  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@Req() req: any) {
    // AuthGuard decodes the JWT and puts the payload on req.user
    // req.user = { id, email, role }
    return { message: 'You are logged in', user: req.user };
  }

  // ─── Example 3: Endpoint with a URL parameter ─────────────────────────────
  // Try it: GET http://localhost:4000/api/v1/practice/users/some-user-id
  @Get('users/:id')
  @UseGuards(AuthGuard)
  getUserById(@Param('id') id: string) {
    return this.practiceService.getUserById(id);
  }

  // ─── Example 4: POST endpoint with a request body ────────────────────────
  // Try it: POST http://localhost:4000/api/v1/practice/echo
  //         body: { "message": "hello" }
  @Post('echo')
  echo(@Body() body: any) {
    // body = whatever JSON you sent
    return { youSent: body, timestamp: new Date() };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HTTP FROM FIRST PRINCIPLES (VIDEO 5) PRACTICE LAB
  // ─────────────────────────────────────────────────────────────────────────

  // Demo state for Idempotency tests
  private static serverCounter = 0;

  /**
   * 🔬 FIRST PRINCIPLE 1: The Raw Anatomy of an HTTP Request
   * Try it with GET:  curl -i http://localhost:4000/api/v1/practice/http/inspect?topic=backend
   * Try it with POST: curl -i -X POST http://localhost:4000/api/v1/practice/http/inspect \
   *                   -H "Content-Type: application/json" \
   *                   -H "X-Custom-Trace-Id: trace-999" \
   *                   -d '{"student":"developer"}'
   */
  @Get('http/inspect')
  inspectGetRequest(
    @Req() req: FastifyRequest,
    @Headers() headers: Record<string, string>,
    @Query() query: Record<string, string>,
    @Ip() ip: string,
  ) {
    return {
      message: 'HTTP Request Dissected (GET)',
      method: req.method,
      url: req.url,
      clientIp: ip,
      httpVersion: req.raw.httpVersion, // e.g. "1.1"
      keepAliveSocket: !req.raw.socket.destroyed,
      headersReceived: {
        host: headers['host'],
        userAgent: headers['user-agent'],
        accept: headers['accept'],
        connection: headers['connection'], // 'keep-alive' in HTTP/1.1
        customHeaders: headers['x-custom-trace-id'] || 'none provided',
        allHeaders: headers,
      },
      queryParams: query,
      body: null,
      firstPrinciplesExplanation:
        'HTTP is a plain-text/stream application-layer protocol running over TCP. The client sent a Request Line + Headers + CRLF.',
    };
  }

  @Post('http/inspect')
  inspectPostRequest(
    @Req() req: FastifyRequest,
    @Headers() headers: Record<string, string>,
    @Query() query: Record<string, string>,
    @Body() body: any,
    @Ip() ip: string,
  ) {
    return {
      message: 'HTTP Request Dissected (POST with Body)',
      method: req.method,
      url: req.url,
      clientIp: ip,
      httpVersion: req.raw.httpVersion,
      headersReceived: {
        contentType: headers['content-type'],
        contentLength: headers['content-length'],
        userAgent: headers['user-agent'],
        allHeaders: headers,
      },
      queryParams: query,
      parsedBody: body,
      firstPrinciplesExplanation:
        'Because this is a POST, Content-Type and Content-Length told Fastify how many bytes to read from the TCP stream and how to deserialize them.',
    };
  }

  /**
   * 🔬 FIRST PRINCIPLE 2: Status Codes & Response Headers
   * Try it:
   *   curl -i http://localhost:4000/api/v1/practice/http/status-lab/200
   *   curl -i http://localhost:4000/api/v1/practice/http/status-lab/201
   *   curl -i http://localhost:4000/api/v1/practice/http/status-lab/400
   *   curl -i http://localhost:4000/api/v1/practice/http/status-lab/401
   *   curl -i http://localhost:4000/api/v1/practice/http/status-lab/404
   *   curl -i http://localhost:4000/api/v1/practice/http/status-lab/500
   */
  @Get('http/status-lab/:code')
  statusLab(
    @Param('code') code: string,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const statusCode = parseInt(code, 10);

    // Set custom HTTP response headers
    reply.header('X-Backend-Series', 'Backend-From-First-Principles');
    reply.header('X-Response-Time-Ms', '1.2');
    reply.header('Cache-Control', 'no-store, no-cache');

    switch (statusCode) {
      case 200:
        reply.status(HttpStatus.OK);
        return { status: 200, category: '2xx Success', description: 'Standard OK response' };
      case 201:
        reply.status(HttpStatus.CREATED);
        return { status: 201, category: '2xx Success', description: 'Resource successfully created' };
      case 204:
        reply.status(HttpStatus.NO_CONTENT);
        return; // 204 MUST have no body!
      case 400:
        throw new BadRequestException('Client sent bad syntax or malformed data');
      case 401:
        throw new UnauthorizedException('Authentication missing or invalid');
      case 403:
        throw new ForbiddenException('Authenticated, but you do not have permission');
      case 404:
        throw new NotFoundException('Requested resource does not exist');
      case 500:
      default:
        reply.status(HttpStatus.INTERNAL_SERVER_ERROR);
        return { status: 500, category: '5xx Server Error', description: 'Uncaught backend fault' };
    }
  }

  /**
   * 🔬 FIRST PRINCIPLE 3: Idempotency in Practice (POST vs PUT vs DELETE)
   *
   * POST /practice/http/idempotency/increment (NON-IDEMPOTENT)
   * Calling this 3 times increases the counter 3 times:
   *   curl -X POST http://localhost:4000/api/v1/practice/http/idempotency/increment
   */
  @Post('http/idempotency/increment')
  incrementCounter() {
    PracticeController.serverCounter += 1;
    return {
      method: 'POST',
      idempotent: false,
      message: 'Calling POST repeatedly CHANGES state every time.',
      currentCounterValue: PracticeController.serverCounter,
    };
  }

  /**
   * PUT /practice/http/idempotency/set (IDEMPOTENT)
   * Calling this 10 times with value=42 always results in value=42:
   *   curl -X PUT http://localhost:4000/api/v1/practice/http/idempotency/set \
   *        -H "Content-Type: application/json" -d '{"value": 42}'
   */
  @Put('http/idempotency/set')
  setCounter(@Body('value') value: number) {
    PracticeController.serverCounter = Number(value) || 0;
    return {
      method: 'PUT',
      idempotent: true,
      message: 'Calling PUT N times with the same payload results in the EXACT same server state.',
      currentCounterValue: PracticeController.serverCounter,
    };
  }

  /**
   * DELETE /practice/http/idempotency/reset (IDEMPOTENT)
   * Deleting/resetting resource state:
   *   curl -X Delete http://localhost:4000/api/v1/practice/http/idempotency/reset
   */
  @Delete('http/idempotency/reset')
  resetCounter() {
    PracticeController.serverCounter = 0;
    return {
      method: 'DELETE',
      idempotent: true,
      message: 'Resetting or deleting resource leaves the same state regardless of repetition.',
      currentCounterValue: PracticeController.serverCounter,
    };
  }

  /**
   * 🔬 FIRST PRINCIPLE 4: Conditional Caching (ETag & If-None-Match -> 304 Not Modified)
   *
   * Step 1: Initial request (Returns 200 OK + full body + ETag header)
   *   curl -i http://localhost:4000/api/v1/practice/http/cache-lab
   *
   * Step 2: Conditional request with matching ETag (Returns 304 Not Modified + ZERO body!)
   *   curl -i http://localhost:4000/api/v1/practice/http/cache-lab -H 'If-None-Match: "v2-hash99"'
   *
   * Step 3: Conditional request with outdated ETag (Returns 200 OK + fresh body)
   *   curl -i http://localhost:4000/api/v1/practice/http/cache-lab -H 'If-None-Match: "v1-outdated"'
   */
  @Get('http/cache-lab')
  cacheLab(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const resourceData = {
      meetingId: 'meet-999',
      title: 'Backend HTTP Deep Dive',
      presenter: 'Developer',
      version: 2,
    };

    // 1. Calculate the current ETag (hash/version fingerprint)
    const currentEtag = `"v2-hash99"`;
    const lastModifiedDate = 'Mon, 12 Oct 2026 08:00:00 GMT';
    // 2. Check if the client sent 'If-None-Match' matching our current ETag
    const clientEtag = req.headers['if-none-match'];

    if (clientEtag === currentEtag) {
      // 3. Match! Resource is identical. Return 304 Not Modified with NO BODY
      reply.status(HttpStatus.NOT_MODIFIED);
      return;
    }

    // 4. Stale or first-time request: send 200 OK with fresh headers and body
    reply.header('ETag', currentEtag);
    reply.header('Last-Modified', lastModifiedDate);
    reply.header('Cache-Control', 'no-cache'); // instructs client to always revalidate with server
    return resourceData;
  }
}
