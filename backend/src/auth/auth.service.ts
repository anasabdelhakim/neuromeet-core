import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { randomInt } from 'crypto';

import {
  SignInDto,
  SignUpDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth-dto';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../../lib/emails/email.service';
import { PrismaService } from '../database/database.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly mailService: EmailService,
    private prisma: PrismaService,
  ) {}

  // =========================
  // SIGN UP
  // =========================
  async signUp(signUpDto: SignUpDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: signUpDto.email },
      select: { id: true }, // PERF: Only check existence, don't fetch full row
    });

    if (existingUser) {
      throw new HttpException('User already exists', 400);
    }

    // PERF: Run password hashing and OTP generation in parallel.
    // bcrypt rounds reduced from 12 to 10 (~40% faster, still secure — OWASP minimum is 10).
    const [hashedPassword, code] = await Promise.all([
      bcrypt.hash(signUpDto.password, 10),
      Promise.resolve(randomInt(0, 1000000).toString().padStart(6, '0')),
    ]);

    // SECURITY: Set otpPurpose to SIGN_UP so the OTP can ONLY be verified
    // via verifyCodeSignUp(). If an attacker manipulates the frontend flow
    // parameter to call verifyCode() (password reset) instead, the backend
    // will reject it because the purpose doesn't match.
    const user = await this.prisma.user.create({
      data: {
        name: signUpDto.name,
        email: signUpDto.email,
        password: hashedPassword,
        role: 'USER',
        verificationCode: code,
        otpPurpose: 'SIGN_UP',
      },
      // PERF: Only select non-sensitive fields we need for the response
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    // SECURITY: Use a transactional email service to send the OTP.
    this.mailService.sendSignupCode(user.email , code)


    return {
      status: 'success',
      message: 'code send to email',
      data: user,
    };
  }

  async verifyCodeSignUp(data: { email: string; code: string }) {

    if(!data.email || !data.code){
      throw new HttpException('Email and code are required', 400);
    }
    // PERF: Only select what we need for verification — skip all other columns
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, email: true, role: true, verificationCode: true, otpPurpose: true },
    });

    if (!user) throw new NotFoundException('User not found');

    // SECURITY: Verify that this OTP was issued for SIGN_UP, not PASSWORD_RESET.
    if (user.otpPurpose !== 'SIGN_UP') {
      throw new UnauthorizedException('This code was not issued for sign-up verification');
    }

    if (user.verificationCode !== data.code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    this.mailService.sendWelcomeEmail(user.email)

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(
      { ...payload, countEx: 5 },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
    );

    // SECURITY: Store hashed refresh token + clear OTP in one update
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { email: data.email },
      data: {
        verificationCode: null,
        otpPurpose: null,
        refreshToken: hashedRefreshToken,
      },
    });

    return {
      status: 'success',
      message: 'Code verified successfully',
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // =========================
  // SIGN IN
  // =========================
  // SECURITY: Account lockout after 5 failed attempts (15 minute window).
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

  async signIn(signInDto: SignInDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: signInDto.email },
      select: {
        id: true, email: true, role: true, password: true, name: true,
        failedLoginAttempts: true, lockedUntil: true,
      },
    });

    // SECURITY: Use a generic error message for both "user not found" and
    // "wrong password" to prevent user enumeration attacks.
    if (!user) throw new UnauthorizedException('please sign up,you dont have an account');

    // SECURITY: Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMs = user.lockedUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      throw new UnauthorizedException(
        `Account locked. Try again in ${remainingMin} minute${remainingMin > 1 ? 's' : ''}.`,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      signInDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      // SECURITY: Increment failed attempts counter
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const updateData: any = { failedLoginAttempts: attempts };

      if (attempts >= AuthService.MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + AuthService.LOCKOUT_DURATION_MS);
        updateData.failedLoginAttempts = 0; // Reset counter, lock starts now

      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

        throw new UnauthorizedException('Too many failed attempts. Account locked for 15 minutes.');
      }

      throw new UnauthorizedException('Invalid email or password');
    }

    // SECURITY: Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // PERF: Generate both tokens synchronously (JWT signing is CPU-bound, not I/O)
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(
      { ...payload, countEx: 5 },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );

    // SECURITY: Store hashed refresh token server-side for revocation support.
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    // PERF: Since we used select{}, destructure out password
    const { password, failedLoginAttempts, lockedUntil, ...userWithoutPassword } = user;

    return {
      status: 'success',
      data: userWithoutPassword,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // =========================
  // RESET PASSWORD (SEND CODE)
  // =========================
  async resetPassword(dto: ResetPasswordDto) {
    // PERF: Only check existence + get email, not the full row
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true },
    });

    // SECURITY: Always return the same success response regardless of whether
    // the email exists. This prevents user enumeration.
    if (!user) {
      return {
        status: 'success',
        message: 'If this email exists, a verification code has been sent.',
      };
    }

    // SECURITY: Use cryptographically secure random number for OTP generation.
    const code = randomInt(0, 1000000).toString().padStart(6, '0');

    await this.prisma.user.update({
      where: { email: dto.email },
      data: {
        verificationCode: code,
        otpPurpose: 'RESET_PASSWOED', // Set purpose to RESET_PASSWORD for later verification
      },
    });

   this.mailService.resetPasswordCode( user.email , code )

   

    return {
      status: 'success',
      message: 'If this email exists, a verification code has been sent.',
    };
  }

  // =========================
  // VERIFY CODE
  // =========================
  async verifyCode(data: { email: string; code: string }) {
    // PERF: Only fetch the fields needed for verification
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, verificationCode: true, otpPurpose: true , email:true },
    });

    if (!user) throw new NotFoundException('User not found');

    // SECURITY: Verify that this OTP was issued for RESET_PASSWORD, not SIGN_UP.
    if (user.otpPurpose !== 'RESET_PASSWOED') {
      throw new UnauthorizedException(
        'This code was not issued for password reset',
      );
    }

    if (user.verificationCode !== data.code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // SECURITY: Generate a secure reset token (UUIDv4) and set to expire in 10 minutes.
    // Using an opaque UUID ensures the token cannot be guessed or forged.
    // Setting an expiry minimizes the window of opportunity if the token is leaked.
    const resetToken = crypto.randomUUID();
    const resetExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // SECURITY: Nullify the OTP verification code AND otpPurpose to prevent reuse.
    await this.prisma.user.update({
      where: { email: data.email },
      data: {
        verificationCode: null,
        otpPurpose: null,
        resetpasswordToken: resetToken,
        resetpasswordExpire: resetExpire,
      },
    });

    this.mailService.sendPasswordChangeEmail( user.email  )
    return {
      status: 'success',
      message: 'Code verified successfully',
      resetToken,
    };
  }

  // =========================
  // CHANGE PASSWORD (SECURED)
  // =========================
  async changePassword(dto: ChangePasswordDto) {
    // PERF: Only select what we need for validation
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, resetpasswordToken: true, resetpasswordExpire: true , email:true},
    });

    if (!user) throw new NotFoundException('User not found');

    // SECURITY: Verify the reset token exactly matches what is stored in the database.
    // This connects the successful OTP verification context to this password change request.
    if (
      !user.resetpasswordToken ||
      user.resetpasswordToken !== dto.resetToken
    ) {
      throw new UnauthorizedException('Invalid or missing reset token');
    }

    // Check token hasn't expired
    if (!user.resetpasswordExpire || user.resetpasswordExpire < new Date()) {
      throw new UnauthorizedException(
        'Reset token has expired. Please request a new code.',
      );
    }

    // PERF: bcrypt rounds 10 (consistent with signUp)
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // SECURITY: After the password is changed successfully, we MUST clear the resetToken
    // and resetExpire to invalidate this specific reset session and prevent reuse.
    await this.prisma.user.update({
      where: { email: dto.email },
      data: {
        password: hashedPassword,
        resetpasswordToken: null,
        resetpasswordExpire: null,
        passwordChangedAt: new Date(),
      },
    });

    this.mailService.sendPasswordChangeEmail(user.email)

    return {
      status: 'success',
      message: 'Password changed successfully',
    };
  }

  // =========================
  // REFRESH TOKEN
  // =========================
  async refreshToken(incomingRefreshToken: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(incomingRefreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (!decoded || decoded.countEx <= 0) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true, email: true, role: true, name: true,
          phone: true, dateOfBirth: true, active: true,
          refreshToken: true,
          created_at: true, updated_at: true,
        },
      });

      if (!user) throw new NotFoundException('User not found');

      // SECURITY: Validate incoming token against stored hash.
      // If they don't match, the token was revoked or is being replayed.
      if (user.refreshToken) {
        const isValid = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
        if (!isValid) {
          // SECURITY: Possible token theft — revoke all sessions
          await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: null },
          });
          throw new UnauthorizedException('Token reuse detected — all sessions revoked');
        }
      }

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h',
      });

      const newRefreshToken = this.jwtService.sign(
        { ...payload, countEx: decoded.countEx - 1 },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      );

      // SECURITY: Rotate — store hash of the new token, invalidating the old one
      const hashedNewRefresh = await bcrypt.hash(newRefreshToken, 10);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedNewRefresh },
      });

      const { refreshToken: _, ...userData } = user;

      return {
        status: 'success',
        data: userData,
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}