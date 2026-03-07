import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';

@Injectable()
export class TrialSecurityService {
  private readonly logger = new Logger(TrialSecurityService.name);
  private razorpay: Razorpay;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.config.get('RAZORPAY_KEY_ID') || '',
      key_secret: this.config.get('RAZORPAY_KEY_SECRET') || '',
    });
  }

  // ── Check Eligibility ───────────────────────────
  async createVerificationOrder(orgId: string, ipAddress: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        users: { where: { role: 'ADMIN' }, take: 1 },
        trialRequests: true,
      },
    });

    if (!org) throw new BadRequestException('Org not found');

    // 🔐 Check 1: Already has trial or active plan
    if (['trial', 'active'].includes(org.subscriptionStatus)) {
      throw new ForbiddenException('Your organization already has an active plan.');
    }

    // 🔐 Check 2: Already has pending/approved request
    const existingRequest = org.trialRequests.find((r) =>
      ['pending', 'approved'].includes(r.status),
    );
    if (existingRequest) {
      throw new ForbiddenException(
        existingRequest.status === 'pending'
          ? 'Trial request already pending. Wait for admin approval.'
          : 'Trial already approved for this organization.',
      );
    }

    // 🔐 Check 3: IP already used
    const ipUsed = await this.prisma.trialRequest.findFirst({
      where: {
        ipAddress,
        status: { in: ['approved', 'pending'] },
        orgId: { not: orgId },
      },
    });
    if (ipUsed) {
      throw new ForbiddenException(
        'A trial request already exists from your network.',
      );
    }

    // 🔐 Check 4: Email domain already used (skip public domains)
    const adminEmail = org.users[0]?.email || '';
    const emailDomain = adminEmail.split('@')[1] || '';
    const publicDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];

    if (!publicDomains.includes(emailDomain)) {
      const domainUsed = await this.prisma.trialRequest.findFirst({
        where: {
          emailDomain,
          status: { in: ['approved', 'pending'] },
          orgId: { not: orgId },
        },
      });
      if (domainUsed) {
        throw new ForbiddenException(
          `Trial already exists for @${emailDomain}. Contact support.`,
        );
      }
    }

    // ✅ All checks passed
    return {
      canProceed: true,
      orgName: org.name,
      email: adminEmail,
      message: 'Eligibility verified.',
    };
  }

  // ── Submit Trial Request ────────────────────────
  async submitTrialRequest(orgId: string, ipAddress: string, data: any) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { users: { where: { role: 'ADMIN' }, take: 1 } },
    });

    if (!org) throw new BadRequestException('Org not found');

    const adminEmail = org.users[0]?.email || '';
    const emailDomain = adminEmail.split('@')[1] || '';

    const request = await this.prisma.trialRequest.create({
      data: {
        orgId,
        ipAddress,
        emailDomain,
        cardFingerprint: null,
        razorpayPaymentId: null,
        status: 'pending',
      },
    });

    this.logger.log(`✅ Trial request submitted for org ${orgId}`);

    return {
      success: true,
      requestId: request.id,
      message: 'Trial request submitted! Admin will review within 24 hours.',
    };
  }

  // ── Get All Requests (Super Admin) ──────────────
  async getPendingRequests(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.prisma.trialRequest.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          org: {
            include: {
              users: { where: { role: 'ADMIN' }, take: 1 },
              plan: true,
            },
          },
        },
      }),
      this.prisma.trialRequest.count(),
    ]);

    return { data: requests, total, page, totalPages: Math.ceil(total / limit) };
  }

  // ── Approve Trial Request ───────────────────────
  async approveRequest(requestId: string, adminUserId: string) {
    const request = await this.prisma.trialRequest.findUnique({
      where: { id: requestId },
      include: {
        org: {
          include: { users: { where: { role: 'ADMIN' }, take: 1 } },
        },
      },
    });

    if (!request) throw new BadRequestException('Request not found');
    if (request.status !== 'pending') {
      throw new BadRequestException('Request already processed');
    }

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 30);

    const starterPlan = await this.prisma.subscriptionPlan.findFirst({
      where: { name: 'Starter' },
    });

    await this.prisma.organization.update({
      where: { id: request.orgId },
      data: {
        subscriptionStatus: 'trial',
        trialStartDate: now,
        trialEndDate: trialEnd,
        trialGrantedBy: adminUserId,
        // planId null rehga — trial mein TRIAL_LIMITS use honge
      },
    });

    await this.prisma.trialRequest.update({
      where: { id: requestId },
      data: {
        status: 'approved',
        reviewedBy: adminUserId,
        reviewedAt: now,
      },
    });

    this.logger.log(`✅ Trial approved for org ${request.orgId}`);

    return {
      success: true,
      trialEndDate: trialEnd,
      orgName: request.org.name,
      adminEmail: request.org.users[0]?.email,
    };
  }

  // ── Reject Trial Request ────────────────────────
  async rejectRequest(requestId: string, adminUserId: string, reason: string) {
    const request = await this.prisma.trialRequest.findUnique({
      where: { id: requestId },
      include: {
        org: {
          include: { users: { where: { role: 'ADMIN' }, take: 1 } },
        },
      },
    });

    if (!request) throw new BadRequestException('Request not found');

    await this.prisma.trialRequest.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        rejectReason: reason,
      },
    });

    return {
      success: true,
      orgName: request.org.name,
      adminEmail: request.org.users[0]?.email,
    };
  }
}