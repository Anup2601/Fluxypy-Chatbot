import {
  Injectable, Logger, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../common/services/email.service';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private razorpay: Razorpay;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private email: EmailService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.config.get('RAZORPAY_KEY_ID') || '',
      key_secret: this.config.get('RAZORPAY_KEY_SECRET') || '',
    });
  }

  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true, name: { not: 'Enterprise' } },
      orderBy: { priceMonthly: 'asc' },
    });
  }

  async getSubscription(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { plan: true },
    });
    if (!org) throw new NotFoundException('Org not found');

    // Auto-expire trial
    if (org.subscriptionStatus === 'trial' && org.trialEndDate && new Date() > org.trialEndDate) {
      await this.prisma.organization.update({
        where: { id: orgId },
        data: { subscriptionStatus: 'expired' },
      });
      org.subscriptionStatus = 'expired';
    }

    return {
      status: org.subscriptionStatus,
      plan: org.plan,
      trialEndDate: org.trialEndDate,
      currentPeriodEnd: org.currentPeriodEnd,
      paymentType: org.paymentType,
      daysLeftInTrial: org.trialEndDate
        ? Math.max(0, Math.ceil((org.trialEndDate.getTime() - Date.now()) / 86400000))
        : null,
    };
  }

  async createSubscriptionOrder(orgId: string, planName: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { users: { where: { role: 'ADMIN' }, take: 1 } },
    });
    if (!org) throw new NotFoundException('Org not found');

    const planId = this.getRazorpayPlanId(planName);
    if (!planId) throw new BadRequestException(`Invalid plan: ${planName}`);

    const dbPlan = await this.prisma.subscriptionPlan.findFirst({
      where: { name: planName },
    });

    const subscription = await (this.razorpay.subscriptions as any).create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12,
      notes: { orgId, planName },
    });

    return {
      subscriptionId: subscription.id,
      keyId: this.config.get('RAZORPAY_KEY_ID'),
      orgName: org.name,
      email: org.users[0]?.email,
      planName,
      amount: Number(dbPlan?.priceMonthly || 0) * 100,
      currency: 'INR',
    };
  }

  async createOneTimeOrder(orgId: string, planName: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { users: { where: { role: 'ADMIN' }, take: 1 } },
    });
    if (!org) throw new NotFoundException('Org not found');

    const dbPlan = await this.prisma.subscriptionPlan.findFirst({
      where: { name: planName },
    });
    if (!dbPlan) throw new BadRequestException('Plan not found');

    const order = await this.razorpay.orders.create({
      amount: Number(dbPlan.priceMonthly) * 100,
      currency: 'INR',
      notes: { orgId, planName, type: 'one_time' },
    } as any);

    return {
      orderId: order.id,
      keyId: this.config.get('RAZORPAY_KEY_ID'),
      orgName: org.name,
      email: org.users[0]?.email,
      planName,
      amount: Number(dbPlan.priceMonthly) * 100,
      currency: 'INR',
    };
  }

  async verifyAndActivate(orgId: string, data: any) {
    const secret = this.config.get('RAZORPAY_KEY_SECRET') || '';
    let generatedSignature: string;

    if (data.paymentType === 'subscription') {
      generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${data.razorpay_payment_id}|${data.razorpay_subscription_id}`)
        .digest('hex');
    } else {
      generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
        .digest('hex');
    }

    if (generatedSignature !== data.razorpay_signature) {
      throw new BadRequestException('Payment verification failed');
    }

    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: { name: data.planName },
    });
    if (!plan) throw new BadRequestException('Plan not found');

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const org = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        planId: plan.id,
        subscriptionStatus: 'active',
        paymentType: data.paymentType,
        razorpaySubscriptionId: data.razorpay_subscription_id || null,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      include: { users: { where: { role: 'ADMIN' }, take: 1 } },
    });

    if (org.users[0]?.email) {
      await this.email.sendPaymentSuccess(
        org.users[0].email,
        org.name,
        data.planName,
        Number(plan.priceMonthly),
      );
    }

    return { success: true, plan: data.planName };
  }

  async cancelSubscription(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });
    if (!org) throw new NotFoundException('Org not found');

    if (org.razorpaySubscriptionId) {
      try {
        await (this.razorpay.subscriptions as any).cancel(
          org.razorpaySubscriptionId,
          { cancel_at_cycle_end: 1 },
        );
      } catch (err) {
        this.logger.warn(`Razorpay cancel failed: ${err.message}`);
      }
    }

    await this.prisma.organization.update({
      where: { id: orgId },
      data: { subscriptionStatus: 'cancelled' },
    });

    return { message: 'Subscription cancelled' };
  }

  private getRazorpayPlanId(planName: string): string | null {
    const map: Record<string, string> = {
      Starter:  this.config.get('RAZORPAY_STARTER_PLAN_ID') || '',
      Pro:      this.config.get('RAZORPAY_PRO_PLAN_ID') || '',
      Business: this.config.get('RAZORPAY_BUSINESS_PLAN_ID') || '',
    };
    return map[planName] || null;
  }
}