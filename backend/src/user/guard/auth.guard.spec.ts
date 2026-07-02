import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { Roles } from '../decorators/user.decorators';

// ==========================================
// AUTH GUARD — SECURITY TEST SUITE
// ==========================================
// Tests every branch of the AuthGuard to ensure:
//   1. Public routes are accessible
//   2. Missing tokens are rejected
//   3. Tampered/expired tokens are rejected
//   4. Wrong roles are rejected
//   5. JWT payload uses `id` (not `_id`) — no admin bypass
//   6. Valid tokens pass and set request.user

describe('AuthGuard — Security Tests', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  // Helper to create a mock ExecutionContext
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

    // Set up the reflector to return the roles for this handler
    jest.spyOn(reflector, 'get').mockReturnValue(handlerRoles);

    return mockContext;
  };

  beforeEach(() => {
    jwtService = new JwtService({ secret: 'test-secret' });
    reflector = new Reflector();
    guard = new AuthGuard(jwtService, reflector);
  });

  // ---- Test 1: Public routes (no @Roles decorator) ----
  it('should allow access to public routes (no @Roles decorator)', async () => {
    const context = createMockContext(undefined, undefined);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  // ---- Test 2: Missing token on protected route ----
  it('should throw 401 when no Bearer token is provided on a protected route', async () => {
    const context = createMockContext(undefined, ['STUDENT']);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  // ---- Test 3: Malformed Authorization header ----
  it('should throw 401 for malformed authorization header (not Bearer)', async () => {
    const context = createMockContext('Basic some-token', ['STUDENT']);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  // ---- Test 4: Invalid/tampered JWT ----
  it('should throw 401 for invalid/tampered JWT', async () => {
    const context = createMockContext('Bearer invalid.jwt.token', ['STUDENT']);
    jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('invalid'));

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  // ---- Test 5: Valid JWT but wrong role ----
  it('should throw 401 when JWT role does not match required roles', async () => {
    // SECURITY: A STUDENT token cannot access a INSTRUCTOR-only endpoint
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

  // ---- Test 6: Valid JWT but empty role ----
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

  // ---- Test 7: Valid JWT with correct role ----
  it('should allow access when JWT role matches required roles', async () => {
    const mockPayload = {
      id: 'student-id',
      email: 'student@test.com',
      role: 'STUDENT',
    };
    const context = createMockContext('Bearer valid-token', ['STUDENT', 'INSTRUCTOR']);
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);

    // Verify request.user was set
    const request = context.switchToHttp().getRequest();
    expect(request.user).toEqual(mockPayload);
  });

  // ---- Test 8: No admin bypass with _id ----
  it('should NOT have an admin bypass using payload._id', async () => {
    // SECURITY: The old guard had: if (payload._id && role === 'admin') return true
    // This test ensures that code path no longer exists.
    // A JWT with _id and role 'admin' should still be rejected if 'admin' isn't in the roles list.
    const context = createMockContext('Bearer valid-token', ['STUDENT', 'INSTRUCTOR']);
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

  // ---- Test 9: JWT payload uses `id` not `_id` in request.user ----
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
