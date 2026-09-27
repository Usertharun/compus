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
import { AppLoggerService } from '@logger/logger.service';
import { EmailService } from '@modules/email/email.service';
import { isCampusEmail, validateCollegeEmail } from '@common/utils/email-validator.util';
import { Prisma, User, UserRole, VerificationType } from '@prisma/client';
import * as argon2 from '@node-rs/argon2';
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
    private readonly emailService: EmailService,
    private readonly logger: AppLoggerService,
  ) {}

  async requestRegistrationOtp(dto: RequestOtpDto): Promise<{ message: string }> {
    const email = validateCollegeEmail(dto.email);
    this.emailService.assertConfigured();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('A verified account with this college email address already exists.');
    }

    const recent = await this.prisma.emailVerification.findFirst({ where: { email, type: VerificationType.REGISTRATION, createdAt: { gt: new Date(Date.now() - 60000) } } });
    if (recent) throw new BadRequestException('Please wait one minute before requesting another code.');
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await argon2.hash(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete any existing unused OTPs for this email
    await this.prisma.emailVerification.deleteMany({
      where: { email, type: VerificationType.REGISTRATION },
    });

    const verification = await this.prisma.emailVerification.create({
      data: {
        email,
        otpHash,
        type: VerificationType.REGISTRATION,
        expiresAt,
      },
    });

    try { await this.emailService.sendOtpEmail(email, otp); }
    catch (error) {
      await this.prisma.emailVerification.deleteMany({ where: { id: verification.id } });
      throw error;
    }
    this.logger.log(`Generated OTP for college email: ${email}`, 'AuthService');

    return { message: 'Verification OTP sent to your college email address' };
  }

  private async checkRegistrationOtp(email: string, otp: string) {
    const verification = await this.prisma.emailVerification.findFirst({
      where: { email, type: VerificationType.REGISTRATION, isUsed: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!verification) throw new BadRequestException('The verification code is invalid or expired. Request a new code.');
    // Reserve an attempt atomically before comparing the hash, including direct registration calls.
    const attempt = await this.prisma.emailVerification.updateMany({
      where: { id: verification.id, attempts: { lt: 3 }, isUsed: false, expiresAt: { gt: new Date() } },
      data: { attempts: { increment: 1 } },
    });
    if (attempt.count !== 1) throw new BadRequestException('Too many verification attempts. Request a new code.');
    if (!await argon2.verify(verification.otpHash, otp)) throw new BadRequestException('Invalid verification code.');
    return verification;
  }

  async verifyOtp(dto: VerifyOtpDto) {
    await this.checkRegistrationOtp(validateCollegeEmail(dto.email), dto.otp);
    return { verified: true, message: 'Code verified. Complete registration before it expires.' };
  }

  async registerWithOtp(dto: RegisterWithOtpDto, userAgent?: string, ipAddress?: string): Promise<AuthResponseDto> {
    const email = validateCollegeEmail(dto.email);
    const verification = await this.checkRegistrationOtp(email, dto.otp);
    const passwordHash = await argon2.hash(dto.password);
    try {
      const result = await this.prisma.$transaction(async tx => {
        const consumed = await tx.emailVerification.updateMany({
          where: { id: verification.id, isUsed: false, expiresAt: { gt: new Date() } }, data: { isUsed: true },
        });
        if (consumed.count !== 1) throw new BadRequestException('This code has already been used or expired.');
        const user = await tx.user.create({
          data: { email, passwordHash, role: UserRole.VERIFIED_USER, isVerified: true, onboardingCompleted: false,
            profile: { create: { name: dto.name.trim(), registerNumber: dto.registerNumber, department: dto.department, year: dto.year, section: dto.section } },
            passwordHistories: { create: { passwordHash } },
          }, include: { profile: true },
        });
        const perms = await tx.permission.findMany({ where: { key: { in: ['canCreateEvent', 'canUploadNotes'] } } });
        if (perms.length) await tx.userPermission.createMany({ data: perms.map(p => ({ userId: user.id, permissionId: p.id })), skipDuplicates: true });
        return this.generateAuthTokens(user, userAgent, ipAddress, false, tx);
      });
      // A welcome email failure must not invalidate an already-created account.
      void this.emailService.sendWelcomeEmail(email, dto.name).catch(() => this.logger.warn('Welcome email could not be delivered', 'AuthService'));
      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('An account with this email already exists. Please sign in.');
      throw error;
    }
  }

  async login(
    dto: LoginDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthResponseDto> {
    const email = validateCollegeEmail(dto.email);

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || user.deletedAt || !user.isActive || !user.isVerified) {
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

    return this.prisma.$transaction(tx => this.generateAuthTokens(user, userAgent, ipAddress, dto.rememberMe, tx));
  }

  async refreshToken(refreshToken: string, userAgent?: string, ipAddress?: string): Promise<AuthResponseDto> {
    let payload: { sub: string };
    try { payload = this.jwtService.verify(refreshToken, { secret: this.configService.get<string>('JWT_REFRESH_SECRET') }); }
    catch { throw new UnauthorizedException('Invalid or expired refresh token'); }
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    return this.prisma.$transaction(async tx => {
      const stored = await tx.refreshToken.findUnique({ where: { tokenHash }, include: { session: true } });
      if (!stored || stored.userId !== payload.sub || stored.isRevoked || stored.expiresAt <= new Date() || !stored.session || stored.session.isRevoked || stored.session.expiresAt <= new Date()) throw new UnauthorizedException('Session expired. Please sign in again.');
      const user = await tx.user.findUnique({ where: { id: payload.sub }, include: { profile: true } });
      if (!user || !user.isActive || !user.isVerified || user.deletedAt || !isCampusEmail(user.email)) throw new UnauthorizedException('Account is unavailable.');
      const consumed = await tx.refreshToken.updateMany({ where: { id: stored.id, isRevoked: false }, data: { isRevoked: true } });
      if (consumed.count !== 1) throw new UnauthorizedException('Refresh token has already been used.');
      await tx.session.update({ where: { id: stored.session.id }, data: { isRevoked: true } });
      return this.generateAuthTokens(user, userAgent, ipAddress, false, tx);
    });
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.prisma.$transaction([
      this.prisma.session.updateMany({ where: { userId, isRevoked: false }, data: { isRevoked: true } }),
      this.prisma.refreshToken.updateMany({ where: { userId, isRevoked: false }, data: { isRevoked: true } }),
    ]);
    return { message: 'Signed out of all sessions.' };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const email = validateCollegeEmail(dto.email);
    this.emailService.assertConfigured();
    const user = await this.prisma.user.findUnique({
      where: { email },
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

    if (!resetRecord || resetRecord.isUsed || resetRecord.expiresAt < new Date() || !isCampusEmail(resetRecord.user.email) || !resetRecord.user.isActive || resetRecord.user.deletedAt) {
      throw new BadRequestException('Password reset token is invalid or has expired.');
    }

    // Check Password History
    await this.verifyPasswordHistory(resetRecord.userId, dto.newPassword);

    const newPasswordHash = await argon2.hash(dto.newPassword);

    await this.prisma.$transaction(async tx => {
      const consumed = await tx.passwordResetToken.updateMany({
        where: { id: resetRecord.id, isUsed: false, expiresAt: { gt: new Date() } }, data: { isUsed: true },
      });
      if (consumed.count !== 1) throw new BadRequestException('Password reset token has already been used or expired.');
      await tx.user.update({ where: { id: resetRecord.userId }, data: { passwordHash: newPasswordHash } });
      await tx.passwordHistory.create({ data: { userId: resetRecord.userId, passwordHash: newPasswordHash } });
      await tx.refreshToken.updateMany({ where: { userId: resetRecord.userId, isRevoked: false }, data: { isRevoked: true } });
      await tx.session.updateMany({ where: { userId: resetRecord.userId, isRevoked: false }, data: { isRevoked: true } });
    });

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
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<AuthResponseDto> {
    // Fetch User PBAC Permissions
    const userPermissions = await db.userPermission.findMany({
      where: { userId: user.id },
      include: { permission: true },
    });

    const permissionKeys = userPermissions.map((up) => up.permission.key);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti: crypto.randomUUID(),
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
    const session = await db.session.create({
      data: {
        userId: user.id,
        tokenHash: sessionTokenHash,
        deviceInfo: userAgent || 'Unknown Device',
        ipAddress: ipAddress || '0.0.0.0',
        userAgent: userAgent || 'Unknown',
        expiresAt,
      },
    });

    await db.refreshToken.create({
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
