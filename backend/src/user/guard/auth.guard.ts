import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Roles } from '../decorators/user.decorators';

// =========================
// JWT AUTHENTICATION & ROLE AUTHORIZATION GUARD
// =========================
// SECURITY: This guard provides the backend's second layer of defense
// (the first is Next.js middleware). It:
//   1. Extracts the JWT from the Authorization header
//   2. Verifies the JWT signature using the server's secret
//   3. Checks the user's role against the allowed roles for the endpoint
// If any step fails, the request is rejected with 401 Unauthorized.
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const roles = this.reflector.get(Roles, context.getHandler());

    // SECURITY: If no @Roles() decorator is present, the endpoint is public.
    if (!roles) {
      return true;
    }

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      // SECURITY: verifyAsync checks both the signature and expiry of the JWT.
      // If the token was tampered with or expired, this throws.
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // SECURITY: Check that the user's role is in the allowed list.
      // The `id` key must match what auth.service.ts and oauth.service.ts
      // put into the JWT payload. Previously this was `_id` in oauth.service
      // which caused a mismatch — now standardized to `id` everywhere.
      if (
        !payload.role ||
        payload.role === '' ||
        !roles.includes(payload.role)
      ) {
        throw new UnauthorizedException();
      }

      // Attach the decoded payload to the request so route handlers can access it.
      // SECURITY: Route handlers should use `req.user.id` to identify the current user.
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  // SECURITY: Extracts Bearer token from the Authorization header.
  // Format: "Bearer <token>"
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}