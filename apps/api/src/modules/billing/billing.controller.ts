import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Ip,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { BillingService } from './billing.service';
import { TrialSecurityService } from './trial-security.service';
import { EmailService } from '../../common/services/email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(
    private billing: BillingService,
    private trialSecurity: TrialSecurityService,
    private email: EmailService,
    private prisma: PrismaService,
  ) {}

  // ── Plans ───────────────────────────────────────
  @Get('plans')
  getPlans() {
    return this.billing.getPlans();
  }

  // ── Subscription Status ─────────────────────────
  @Get('subscription')
  getSubscription(@CurrentUser('orgId') orgId: string) {
    return this.billing.getSubscription(orgId);
  }

  // ── TRIAL: Step 1 — Create ₹0 verify order ──────
  @Post('trial/verify-order')
  createVerificationOrder(
    @CurrentUser('orgId') orgId: string,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) || ip || 'unknown';
    return this.trialSecurity.createVerificationOrder(orgId, ipAddress);
  }

  // ── TRIAL: Step 2 — Submit after card verify ────
  @Post('trial/submit')
  async submitTrialRequest(
    @CurrentUser('orgId') orgId: string,
    @Body() body: any,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) || ip || 'unknown';

    const result = await this.trialSecurity.submitTrialRequest(
      orgId,
      ipAddress,
      body,
    );

    // Send confirmation email
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { users: { where: { role: 'ADMIN' }, take: 1 } },
    });

    if (org?.users[0]?.email) {
      await this.email.sendTrialRequestSubmitted(
        org.users[0].email,
        org.name,
      );
    }

    return result;
  }

  // ── PAID: Subscription Order ────────────────────
  @Post('subscription-order')
  createSubscriptionOrder(
    @CurrentUser('orgId') orgId: string,
    @Body('planName') planName: string,
  ) {
    return this.billing.createSubscriptionOrder(orgId, planName);
  }

  // ── PAID: One-time Order ────────────────────────
  @Post('one-time-order')
  createOneTimeOrder(
    @CurrentUser('orgId') orgId: string,
    @Body('planName') planName: string,
  ) {
    return this.billing.createOneTimeOrder(orgId, planName);
  }

  // ── PAID: Verify Payment ────────────────────────
  @Post('verify')
  verifyPayment(
    @CurrentUser('orgId') orgId: string,
    @Body() body: any,
  ) {
    return this.billing.verifyAndActivate(orgId, body);
  }

  // ── Cancel Subscription ─────────────────────────
  @Post('cancel')
  cancel(@CurrentUser('orgId') orgId: string) {
    return this.billing.cancelSubscription(orgId);
  }

  // GET /api/v1/billing/trial/status
  @Get('trial/status')
  async getTrialStatus(@CurrentUser('orgId') orgId: string) {
    const request = await this.prisma.trialRequest.findFirst({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      select: {
        status: true,
        rejectReason: true,
        createdAt: true,
      },
    });
    return request || { status: 'none' };
  }
}