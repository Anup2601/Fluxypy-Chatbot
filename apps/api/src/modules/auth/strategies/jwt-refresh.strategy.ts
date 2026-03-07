import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private config: ConfigService) {
    const secret = config.get<string>('JWT_REFRESH_SECRET');
    if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined in .env');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      passReqToCallback: true as true,
      ignoreExpiration: false,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.headers.authorization
      ?.replace('Bearer ', '')
      .trim();
    return { ...payload, refreshToken };
  }
}