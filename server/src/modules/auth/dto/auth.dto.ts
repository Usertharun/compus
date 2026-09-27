import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({ example: 'student@srmist.edu.in', description: 'Official college email address' })
  @IsEmail({}, { message: 'Invalid email address format' })
  @IsNotEmpty()
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'student@srmist.edu.in' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Enter the six-digit verification code' })
  otp: string;
}

export class RegisterWithOtpDto {
  @ApiProperty({ example: 'student@srmist.edu.in' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Enter the six-digit verification code' })
  otp: string;

  @ApiProperty({ example: 'Argon2SecurePassword123!' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  password: string;

  @ApiProperty({ example: 'Alex Chen' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  name: string;

  @ApiPropertyOptional({ example: 'RA2111003010001' })
  @IsOptional()
  @IsString()
  registerNumber?: string;

  @ApiPropertyOptional({ example: 'Computer Science and Engineering' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: '4th Year' })
  @IsOptional()
  @IsString()
  year?: string;

  @ApiPropertyOptional({ example: 'CSE-A' })
  @IsOptional()
  @IsString()
  section?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'student@srmist.edu.in' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Argon2SecurePassword123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Valid refresh token string' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'student@srmist.edu.in' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token string' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NewArgon2Password123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123!' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  newPassword: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
    onboardingCompleted: boolean;
    permissions: string[];
  };
}
