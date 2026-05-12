import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';
import { Roles } from '../decorators/user.decorators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    const token = this.extractTokenFromHeader(request);
    const roles = this.reflector.get<string[]>(Roles, context.getHandler());

    // لو مفيش roles → route مفتوح
    if (!roles) return true;

    if (!token) throw new UnauthorizedException();

    try {
      const payload: any = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // ✅ لو Admin يدخل على أي حاجة
      if (payload.role?.toLowerCase() === 'admin') {
        (request as any).user = payload;
        return true;
      }

      // ✅ تحقق من الرولز
      if (!payload.role || !roles.includes(payload.role)) {
        throw new UnauthorizedException();
      }

      (request as any).user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(
    request: FastifyRequest,
  ): string | undefined {
    const authHeader = request.headers.authorization;

    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}