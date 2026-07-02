import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';

// SECURITY: This DTO only exposes the fields that a user is allowed to update
// about themselves. Sensitive fields like 'role', 'email', 'password',
// 'verificationCode', and 'active' are excluded to prevent privilege escalation.
// Password changes must go through the dedicated /auth/change-password flow.
export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'name must be a string' })
  @MinLength(3, { message: 'name must be at least 3 characters' })
  @MaxLength(30, { message: 'name must be at most 30 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsBoolean()
  isProfileComplete?: boolean;
}
