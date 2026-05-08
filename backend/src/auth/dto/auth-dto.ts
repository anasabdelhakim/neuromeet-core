import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString({ message: 'name must be string' })
  @MinLength(3, { message: 'name must be at least 3 characters' })
  @MaxLength(30, { message: 'name must be at most 30 characters' })
  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @IsEmail({}, { message: 'email not valid' })
  @IsNotEmpty({ message: 'email is required' })
  email: string;

  @IsString({ message: 'password must be string' })
  @MinLength(8, { message: 'password must be at least 8 characters' })
  @MaxLength(20, { message: 'password must be at most 20 characters' })
  @IsNotEmpty({ message: 'password is required' })
  password: string;
}

export class SignInDto {
  @IsEmail({}, { message: 'email not valid' })
  @IsNotEmpty({ message: 'email is required' })
  email: string;

  @IsString({ message: 'password must be string' })
  @MinLength(8, { message: 'password must be at least 8 characters' })
  @MaxLength(20, { message: 'password must be at most 20 characters' })
  @IsNotEmpty({ message: 'password is required' })
  password: string;
}

export class ResetPasswordDto {
  @IsString({ message: 'email must be string' })
  @IsEmail({}, { message: 'email not valid' })
  @IsNotEmpty({ message: 'email is required' })
  email: string;
}

export class ChangePasswordDto {
  @IsEmail({}, { message: 'email not valid' })
  @IsNotEmpty({ message: 'email is required' })
  email: string;

  @IsString({ message: 'password must be string' })
  @MinLength(8, { message: 'password must be at least 8 characters' })
  @MaxLength(20, { message: 'password must be at most 20 characters' })
  @IsNotEmpty({ message: 'password is required' })
  password: string;

  @IsString({ message: 'resetToken must be string' })
  @IsNotEmpty({ message: 'resetToken is required' })
  resetToken: string;
}