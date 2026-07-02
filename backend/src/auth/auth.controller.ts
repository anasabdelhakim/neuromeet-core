import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { Roles } from '../user/decorators/user.decorators';
import { AuthGuard } from '../user/guard/auth.guard';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerifyCodeDto,
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
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  // SECURITY: Max 3 resend attempts per 60 seconds per IP.
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @Post('/resend-signup-code')
  resendSignupCode(@Body() email: ResetPasswordDto) {
    return this.authService.resendSignupCode(email);
  }

  // SECURITY: Max 5 OTP verification attempts per 60 seconds per IP.
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('/signup-code')
  verifyCodeSignUp(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authService.verifyCodeSignUp(verifyCodeDto);
  }

  // SECURITY: Max 5 login attempts per 60 seconds per IP.
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('/sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  // SECURITY: Max 3 reset password requests per 60 seconds per IP.
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @Post('/reset-password')
  resetPassword(@Body() email: ResetPasswordDto) {
    return this.authService.resetPassword(email);
  }

  // SECURITY: Max 5 OTP verification attempts per 60 seconds per IP.
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('/verify-code')
  verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authService.verifyCode(verifyCodeDto);
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('/change-password')
  changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(changePasswordDto);
  }

  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('/refresh-token')
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('/logout')
  @Roles(['INSTRUCTOR', 'STUDENT', 'ADMIN'])
  @UseGuards(AuthGuard)
  logout(@Req() req: any) {
    return this.authService.logout(req.user.id);
  }
}
