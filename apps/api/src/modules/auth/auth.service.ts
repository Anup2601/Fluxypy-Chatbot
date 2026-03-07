import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../common/services/email.service';
import * as bcrypt from 'bcrypt';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'fpy_pub_';
  for (let i = 0; i < 24; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private email: EmailService,
  ) {}

  // ── REGISTER → Send OTP ─────────────────────────
  async register(dto: {
    orgName: string;
    email: string;
    password: string;
  }) {
    // Check email exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    // Get Free plan
    const freePlan = await this.prisma.subscriptionPlan.findFirst({
      where: { name: 'Free' },
    });

    // Create unique slug
    let slug = slugify(dto.orgName);
    const slugExists = await this.prisma.organization.findUnique({
      where: { slug },
    });
    if (slugExists) slug = `${slug}-${Date.now()}`;

    // Create org
    const org = await this.prisma.organization.create({
      data: {
        name: dto.orgName,
        slug,
        apiKey: generateApiKey(),
        planId: freePlan?.id,
        subscriptionStatus: 'none',
        settings: {},
      },
    });

    // Hash password + generate OTP
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Create user (unverified)
    await this.prisma.user.create({
      data: {
        orgId: org.id,
        email: dto.email,
        passwordHash,
        role: 'ADMIN',
        isVerified: false,
        otpCode: otp,
        otpExpiresAt,
        otpAttempts: 0,
      },
    });

    // Send OTP email
    try {
      await this.email.sendOtpEmail(dto.email, dto.orgName, otp);
      this.logger.log(`✅ OTP sent to ${dto.email}`);
    } catch (err: any) {
      this.logger.error(`❌ OTP email failed: ${err.message}`);
    }

    return {
      success: true,
      requiresVerification: true,
      email: dto.email,
      message: 'OTP sent to your email. Please verify to continue.',
    };
  }

  // ── VERIFY OTP → Login ──────────────────────────
  async verifyOtp(dto: { email: string; otp: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { org: true },
    });

    if (!user) throw new BadRequestException('User not found');
    if (user.isVerified) throw new BadRequestException('Email already verified');

    // Max 5 attempts
    if (user.otpAttempts >= 5) {
      throw new ForbiddenException(
        'Too many attempts. Please request a new OTP.',
      );
    }

    // Check expiry
    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      throw new BadRequestException('OTP expired. Please request a new one.');
    }

    // Wrong OTP
    if (user.otpCode !== dto.otp) {
      await this.prisma.user.update({
        where: { email: dto.email },
        data: { otpAttempts: { increment: 1 } },
      });
      const attemptsLeft = 4 - user.otpAttempts;
      throw new BadRequestException(
        `Invalid OTP. ${attemptsLeft} attempts remaining.`,
      );
    }

    // ✅ Correct OTP — mark verified
    await this.prisma.user.update({
      where: { email: dto.email },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null,
        otpAttempts: 0,
      },
    });

    this.logger.log(`✅ Email verified: ${dto.email}`);

    // Return tokens → auto login
    return this.generateTokens(user, user.org);
  }

  // ── RESEND OTP ──────────────────────────────────
  async resendOtp(dto: { email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { org: true },
    });

    if (!user) throw new BadRequestException('User not found');
    if (user.isVerified) throw new BadRequestException('Already verified');

    // 60 second cooldown
    if (user.otpExpiresAt) {
      const elapsed = 10 * 60 * 1000 - (user.otpExpiresAt.getTime() - Date.now());
      if (elapsed < 60 * 1000) {
        const wait = Math.ceil((60 * 1000 - elapsed) / 1000);
        throw new BadRequestException(
          `Wait ${wait} seconds before requesting new OTP.`,
        );
      }
    }

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: { email: dto.email },
      data: { otpCode: otp, otpExpiresAt, otpAttempts: 0 },
    });

    await this.email.sendOtpEmail(dto.email, user.org.name, otp);

    return { success: true, message: 'New OTP sent to your email.' };
  }

  // ── LOGIN (No OTP needed) ───────────────────────
  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { org: true },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    // If not verified → send OTP again and redirect to verify
    if (!user.isVerified) {
      const otp = generateOtp();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await this.prisma.user.update({
        where: { email: dto.email },
        data: { otpCode: otp, otpExpiresAt, otpAttempts: 0 },
      });
      await this.email.sendOtpEmail(dto.email, user.org.name, otp);

      throw new ForbiddenException(
        JSON.stringify({
          requiresVerification: true,
          email: dto.email,
          message: 'Email not verified. OTP sent again.',
        }),
      );
    }

    // ✅ Verified → direct login
    return this.generateTokens(user, user.org);
  }

  // ── REFRESH ─────────────────────────────────────
  async refresh(token: string) {
    try {
      const payload = this.jwt.verify(token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { org: true },
      });
      if (!user) throw new UnauthorizedException();
      return this.generateTokens(user, user.org);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // ── GET ME ───────────────────────────────────────
  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        org: {
          select: {
            id: true,
            name: true,
            slug: true,
            apiKey: true,
            status: true,
            subscriptionStatus: true,
            plan: { select: { name: true } },
          },
        },
      },
    });
  }

  // ── PRIVATE: Generate Tokens ─────────────────────
  private generateTokens(user: any, org: any) {
    const jwtSecret = this.config.get<string>('JWT_SECRET');
    const refreshSecret = this.config.get<string>('JWT_ACCESS_SECRET');

    if (!jwtSecret || !refreshSecret) {
      throw new Error('JWT secrets not configured in .env');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      orgId: org.id,
    };

    const accessToken = this.jwt.sign(payload, {
      secret: jwtSecret,
      expiresIn: '1d',
    });

    const refreshToken = this.jwt.sign(
      { sub: user.id },
      {
        secret: refreshSecret,
        expiresIn: '7d',
      },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        orgId: org.id,
        orgName: org.name,
        orgSlug: org.slug,
      },
    };
  }
}