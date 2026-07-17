import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { Roles } from '../decorators/current-user.decorator';
describe('AuthGuard — Security Tests', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;
  const createMockContext = (
    authHeader?: string,
    handlerRoles?: string[],
  ): ExecutionContext => {
    const mockRequest = {
      headers: {
        authorization: authHeader,
      },
    } as any;
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => ({}),
    } as unknown as ExecutionContext;
    jest.spyOn(reflector, 'get').mockReturnValue(handlerRoles);
    return mockContext;
  };
  beforeEach(() => {
    jwtService = new JwtService({ secret: 'test-secret' });
    reflector = new Reflector();
    guard = new AuthGuard(jwtService, reflector);
  });
  it('should allow access to public routes (no @Roles decorator)', async () => {
    const context = createMockContext(undefined, undefined);
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });
  it('should throw 401 when no Bearer token is provided on a protected route', async () => {
    const context = createMockContext(undefined, ['STUDENT']);
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
  it('should throw 401 for malformed authorization header (not Bearer)', async () => {
    const context = createMockContext('Basic some-token', ['STUDENT']);
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
  it('should throw 401 for invalid/tampered JWT', async () => {
    const context = createMockContext('Bearer invalid.jwt.token', ['STUDENT']);
    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockRejectedValue(new Error('invalid'));
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
  it('should throw 401 when JWT role does not match required roles', async () => {
    const context = createMockContext('Bearer valid-token', ['INSTRUCTOR']);
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
      id: 'student-id',
      email: 'student@test.com',
      role: 'STUDENT',
    });
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
  it('should throw 401 when JWT has empty role string', async () => {
    const context = createMockContext('Bearer valid-token', ['STUDENT']);
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
      id: 'user-id',
      email: 'user@test.com',
      role: '',
    });
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
  it('should allow access when JWT role matches required roles', async () => {
    const mockPayload = {
      id: 'student-id',
      email: 'student@test.com',
      role: 'STUDENT',
    };
    const context = createMockContext('Bearer valid-token', [
      'STUDENT',
      'INSTRUCTOR',
    ]);
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    const request = context.switchToHttp().getRequest();
    expect(request.user).toEqual(mockPayload);
  });
  it('should NOT have an admin bypass using payload._id', async () => {
    const context = createMockContext('Bearer valid-token', [
      'STUDENT',
      'INSTRUCTOR',
    ]);
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
      _id: 'attacker-id',
      id: 'attacker-id',
      email: 'attacker@test.com',
      role: 'admin', // <-- Crafted admin role
    });
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
  it('should set request.user with `id` field from JWT payload', async () => {
    const mockPayload = {
      id: 'user-123',
      email: 'user@test.com',
      role: 'STUDENT',
    };
    const context = createMockContext('Bearer valid-token', ['STUDENT']);
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);
    await guard.canActivate(context);
    const request = context.switchToHttp().getRequest();
    expect(request.user.id).toBe('user-123');
    expect(request.user._id).toBeUndefined();
  });
});
