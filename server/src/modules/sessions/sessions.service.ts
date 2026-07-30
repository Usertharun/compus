import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { AppLoggerService } from '@logger/logger.service';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
  ) {}

  async getUserSessions(userId: string) {
    return this.prisma.session.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastSeenAt: 'desc' },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        userAgent: true,
        lastSeenAt: true,
        createdAt: true,
      },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException(`Session '${sessionId}' not found`);
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { isRevoked: true },
    });

    await this.prisma.refreshToken.updateMany({
      where: { sessionId, isRevoked: false },
      data: { isRevoked: true },
    });

    this.logger.log(`Revoked session ${sessionId} for user ${userId}`, 'SessionsService');

    return { message: 'Session revoked successfully' };
  }

  async revokeAllOtherSessions(userId: string, currentSessionId?: string) {
    const whereCondition = currentSessionId
      ? { userId, id: { not: currentSessionId }, isRevoked: false }
      : { userId, isRevoked: false };

    const result = await this.prisma.session.updateMany({
      where: whereCondition,
      data: { isRevoked: true },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    this.logger.log(`Revoked ${result.count} other sessions for user ${userId}`, 'SessionsService');

    return { message: `Revoked ${result.count} active device session(s)` };
  }
}
