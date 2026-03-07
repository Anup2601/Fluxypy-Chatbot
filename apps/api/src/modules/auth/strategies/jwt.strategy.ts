import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const secret = config.get<string>('JWT_ACCESS_SECRET');
    if (!secret) throw new Error('JWT_ACCESS_SECRET is not defined in .env');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, orgId: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }
}