import {
  Body,
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
} from './dto/auth-dto';

// SECURITY: ThrottlerGuard enforces rate limiting on all endpoints in this controller.
// This is the primary defense against brute-force attacks on passwords and OTP codes.
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // SECURITY: Max 5 sign-up attempts per 60 seconds per IP.
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('/sign-up')
  signUp(
    @Body(new ValidationPipe({ forbidNonWhitelisted: true }))
    signUpDto: SignUpDto,
  ) {
    return this.authService.signUp(signUpDto);
  }

  // SECURITY: Max 5 OTP verification attempts per 60 seconds per IP.
  // A 6-digit OTP has only 1,000,000 possibilities — rate limiting is critical.
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('/signup-code')
  verifyCodeSignUp(
    @Body(new ValidationPipe({ forbidNonWhitelisted: true }))
    verifyCode: {
      email: string;
      code: string;
    },
  ) {
    return this.authService.verifyCodeSignUp(verifyCode);
  }

  // SECURITY: Max 5 login attempts per 60 seconds per IP.
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('/sign-in')
  signIn(
    @Body(new ValidationPipe({ forbidNonWhitelisted: true }))
    signInDto: SignInDto,
  ) {
    return this.authService.signIn(signInDto);
  }

  // SECURITY: Max 3 reset password requests per 60 seconds per IP.
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @Post('/reset-password')
  resetPassword(
    @Body(new ValidationPipe({ forbidNonWhitelisted: true }))
    email: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(email);
  }

  // SECURITY: Max 5 OTP verification attempts per 60 seconds per IP.
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('/verify-code')
  verifyCode(
    @Body(new ValidationPipe({ forbidNonWhitelisted: true }))
    verifyCode: {
      email: string;
      code: string;
    },
  ) {
    return this.authService.verifyCode(verifyCode);
  }

  @Post('/change-password')
  changePassword(
    @Body(new ValidationPipe({ forbidNonWhitelisted: true }))
    changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(changePasswordDto);
  }

  @Post('/refresh-token')
  refreshToken(@Body('refreshToken') refresh_Token: string) {
    return this.authService.refreshToken(refresh_Token);
  }
}