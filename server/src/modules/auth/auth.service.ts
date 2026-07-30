import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@database/prisma.service';
import { RedisService } from '@redis/redis.service';
import { AppLoggerService } from '@logger/logger.service';
import { EmailService } from '@modules/email/email.service';
import { validateCollegeEmail } from '@common/utils/email-validator.util';
import { User, UserRole, VerificationType } from '@prisma/client';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import {
  AuthResponseDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterWithOtpDto,
  RequestOtpDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
    private readonly logger: AppLoggerService,
  ) {}

  async requestRegistrationOtp(dto: RequestOtpDto): Promise<{ message: string }> {
    const email = validateCollegeEmail(dto.email);

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('A verified account with this college email address already exists.');
    }

    // Generate 6-digit cryptographically secure OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await argon2.hash(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete any existing unused OTPs for this email
    await this.prisma.emailVerification.deleteMany({
      where: { email, type: VerificationType.REGISTRATION },
    });

    await this.prisma.emailVerification.create({
      data: {
        email,
        otpHash,
        type: VerificationType.REGISTRATION,
        expiresAt,
      },
    });

    await this.emailService.sendOtpEmail(email, otp);
    this.logger.log(`Generated OTP for college email: ${email}`, 'AuthService');

    return { message: 'Verification OTP sent to your college email address' };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ verified: boolean; message: string }> {
    const email = validateCollegeEmail(dto.email);

    const verification = await this.prisma.emailVerification.findFirst({
      where: {
        email,
        type: VerificationType.REGISTRATION,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      throw new BadRequestException('OTP code is invalid or has expired. Please request a new code.');
    }

    if (verification.attempts >= 3) {
      throw new BadRequestException('Maximum OTP attempt threshold exceeded. Request a new OTP.');
    }

    const isValid = await argon2.verify(verification.otpHash, dto.otp);

    if (!isValid) {
      await this.prisma.emailVerification.update({
        where: { id: verification.id },
        data: { attempts: verification.attempts + 1 },
      });
      throw new BadRequestException('Invalid OTP code. Please check your email.');
    }

    return { verified: true, message: 'OTP verified successfully. Proceed to account creation.' };
  }

  async registerWithOtp(
    dto: RegisterWithOtpDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    const email = validateCollegeEmail(dto.email);

    const verification = await this.prisma.emailVerification.findFirst({
      where: {
        email,
        type: VerificationType.REGISTRATION,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      throw new BadRequestException('Valid OTP verification is required before registration.');
    }

    const isValidOtp = await argon2.verify(verification.otpHash, dto.otp);
    if (!isValidOtp) {
      throw new BadRequestException('Invalid OTP verification code.');
    }

    // Mark OTP used
    await this.prisma.emailVerification.update({
      where: { id: verification.id },
      data: { isUsed: true },
    });

    // Hash password with Argon2
    const passwordHash = await argon2.hash(dto.password);

    // Create User & Profile
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.VERIFIED_USER,
        isVerified: true,
        onboardingCompleted: false,
        profile: {
          create: {
            name: dto.name,
            registerNumber: dto.registerNumber,
            department: dto.department,
            year: dto.year,
            section: dto.section,
          },
        },
        passwordHistories: {
          create: { passwordHash },
        },
      },
      include: { profile: true },
    });

    // Assign default student permissions (PBAC)
    const defaultPermissions = [
      'canCreateEvent',
      'canUploadNotes',
      'canModerateCommunity',
    ];

    const perms = await this.prisma.permission.findMany({
      where: { key: { in: defaultPermissions } },
    });

    if (perms.length > 0) {
      await this.prisma.userPermission.createMany({
        data: perms.map((p) => ({
          userId: user.id,
          permissionId: p.id,
        })),
        skipDuplicates: true,
      });
    }

    await this.emailService.sendWelcomeEmail(email, dto.name);
    this.logger.log(`✅ Registered new account with college email: ${user.id} (${email})`, 'AuthService');

    return this.generateAuthTokens(user, userAgent, ipAddress);
  }

  async login(
    dto: LoginDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || user.deletedAt || !user.isActive) {
      throw new UnauthorizedException('Invalid email address or password credentials');
    }

    const isMatch = await argon2.verify(user.passwordHash, dto.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email address or password credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.log(`🔑 Argon2 Login successful for user: ${user.id}`, 'AuthService');

    return this.generateAuthTokens(user, userAgent, ipAddress, dto.rememberMe);
  }

  async refreshToken(
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
      });

      if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token is invalid, expired, or revoked');
      }

      // Revoke old refresh token
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { profile: true },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User account is disabled or no longer exists');
      }

      return this.generateAuthTokens(user, userAgent, ipAddress);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string, authHeader?: string, sessionId?: string): Promise<{ message: string }> {
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await this.redisService.blacklistToken(tokenHash, 900);
    }

    if (sessionId) {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { isRevoked: true },
      });
    }

    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });

    if (user && user.isActive) {
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15m

      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      await this.emailService.sendPasswordResetEmail(user.email, token);
    }

    return { message: 'If a matching college account exists, password reset instructions have been dispatched.' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');

    const resetRecord = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.isUsed || resetRecord.expiresAt < new Date()) {
      throw new BadRequestException('Password reset token is invalid or has expired.');
    }

    // Check Password History
    await this.verifyPasswordHistory(resetRecord.userId, dto.newPassword);

    const newPasswordHash = await argon2.hash(dto.newPassword);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: newPasswordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { isUsed: true },
      }),
      this.prisma.passwordHistory.create({
        data: {
          userId: resetRecord.userId,
          passwordHash: newPasswordHash,
        },
      }),
      // Revoke all sessions on password reset
      this.prisma.session.updateMany({
        where: { userId: resetRecord.userId, isRevoked: false },
        data: { isRevoked: true },
      }),
    ]);

    return { message: 'Password reset completed successfully. Please log in with your new password.' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User account not found');
    }

    const isCurrentValid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!isCurrentValid) {
      throw new BadRequestException('Current password entered is incorrect.');
    }

    await this.verifyPasswordHistory(userId, dto.newPassword);

    const newPasswordHash = await argon2.hash(dto.newPassword);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      }),
      this.prisma.passwordHistory.create({
        data: {
          userId,
          passwordHash: newPasswordHash,
        },
      }),
    ]);

    return { message: 'Password changed successfully.' };
  }

  private async verifyPasswordHistory(userId: string, newPassword: string): Promise<void> {
    const recentHistories = await this.prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    for (const h of recentHistories) {
      const match = await argon2.verify(h.passwordHash, newPassword);
      if (match) {
        throw new BadRequestException('New password cannot match any of your last 3 passwords.');
      }
    }
  }

  private async generateAuthTokens(
    user: User & { profile?: Record<string, unknown> | null },
    userAgent?: string,
    ipAddress?: string,
    rememberMe = false,
  ): Promise<AuthResponseDto> {
    // Fetch User PBAC Permissions
    const userPermissions = await this.prisma.userPermission.findMany({
      where: { userId: user.id },
      include: { permission: true },
    });

    const permissionKeys = userPermissions.map((up) => up.permission.key);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') || '15m') as any,
    });

    const refreshExpiry = rememberMe ? '30d' : '7d';

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiresIn: refreshExpiry as any,
    });

    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const sessionTokenHash = crypto.createHash('sha256').update(accessToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 7));

    // Create Device Session
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: sessionTokenHash,
        deviceInfo: userAgent || 'Unknown Device',
        ipAddress: ipAddress || '0.0.0.0',
        userAgent: userAgent || 'Unknown',
        expiresAt,
      },
    });

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        sessionId: session.id,
        tokenHash: refreshHash,
        expiresAt,
        createdByIp: ipAddress || '0.0.0.0',
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: (user.profile?.name as string) || user.email.split('@')[0],
        onboardingCompleted: user.onboardingCompleted,
        permissions: permissionKeys,
      },
    };
  }
}
