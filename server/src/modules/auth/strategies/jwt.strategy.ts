import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '@database/prisma.service';
import * as crypto from 'crypto';

import { Request } from 'express';
import { isAllowedAccountEmail } from '@common/utils/email-validator.util';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: true as const,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const rawToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!rawToken) throw new UnauthorizedException('Missing session token');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const session = await this.prisma.session.findUnique({ where: { tokenHash } });
    if (!session || session.userId !== payload.sub || session.isRevoked || session.expiresAt <= new Date()) throw new UnauthorizedException('Session expired or revoked');

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { profile: true },
    });

    if (!user || !user.isActive || !user.isVerified || user.deletedAt || !isAllowedAccountEmail(user.email, user.role, this.configService.get<string>('OWNER_EMAIL'))) {
      throw new UnauthorizedException('User no longer exists');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.profile?.name || user.email.split('@')[0],
      onboardingCompleted: user.onboardingCompleted,
      profile: user.profile,
    };
  }
}
