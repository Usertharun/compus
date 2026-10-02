import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { isAllowedAccountEmail } from '@common/utils/email-validator.util';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true as const,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken || !isAllowedAccountEmail(payload.email, payload.role, this.configService.get<string>('OWNER_EMAIL'))) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return {
      userId: payload.sub,
      email: payload.email,
      refreshToken,
    };
  }
}
