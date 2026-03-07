import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const FREE_LIMITS = {
  daily_api_calls: 50,
  daily_conversations: 15,
  daily_visitors: 50,
  monthly_api_calls: 500,
  monthly_conversations: 300,
  monthly_visitors: 500,
  kb_size_mb: 10,
  messages_per_conversation: 5,
};

const TRIAL_LIMITS = {
  daily_api_calls: 100,
  daily_conversations: 50,
  daily_visitors: 100,
  monthly_api_calls: 2000,
  monthly_conversations: 800,
  monthly_visitors: 2000,
  kb_size_mb: 30,
  messages_per_conversation: 10,
};

export type UsageType = 'api_call' | 'visitor' | 'conversation';

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  constructor(private prisma: PrismaService) {}

  async checkAndIncrement(orgId: string, type: UsageType): Promise<void> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { plan: true },
    });

    if (!org) throw new ForbiddenException('Organization not found');

    // Expired = block
    if (org.subscriptionStatus === 'expired') {
      throw new ForbiddenException(
        'Your trial has expired. Please subscribe to continue.',
      );
    }

    // Check trial expiry
    if (org.subscriptionStatus === 'trial' && org.trialEndDate) {
      if (new Date() > org.trialEndDate) {
        await this.prisma.organization.update({
          where: { id: orgId },
          data: { subscriptionStatus: 'expired' },
        });
        throw new ForbiddenException(
          'Your trial has expired. Please subscribe to continue.',
        );
      }
    }

    const limits = this.getLimits(org);
    const today = this.getTodayDate();
    const usage = await this.getOrCreateUsage(orgId, today);

    // Daily check
    this.checkDailyLimit(type, usage, limits);

    // Monthly check
    await this.checkMonthlyLimit(orgId, type, limits);

    // Increment
    await this.incrementUsage(orgId, today, type);
  }

  async checkKbSize(orgId: string, fileSizeMb: number): Promise<void> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { plan: true },
    });
    if (!org) throw new ForbiddenException('Org not found');

    const limits = this.getLimits(org);
    const kbLimit = limits.kb_size_mb || 10;

    const sources = await this.prisma.knowledgeSource.findMany({
      where: { orgId, status: 'READY' },
      select: { tokenCount: true },
    });

    const currentMb = sources.reduce(
      (sum, s) => sum + (s.tokenCount || 0) * 0.000004, 0,
    );

    if (currentMb + fileSizeMb > kbLimit) {
      throw new ForbiddenException(
        `KB limit reached (${kbLimit}MB). Current: ${currentMb.toFixed(1)}MB. Upgrade your plan.`,
      );
    }
  }

  async getUsageStats(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { plan: true },
    });
    if (!org) return null;

    const today = this.getTodayDate();
    const usageRecord = await this.getOrCreateUsage(orgId, today);
    const limits = this.getLimits(org);

    if (!usageRecord) return null;
    const usage = usageRecord;

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthly = await this.prisma.usageRecord.aggregate({
      where: { orgId, date: { gte: monthStart } },
      _sum: {
        apiCallsToday: true,
        visitorsToday: true,
        conversationsToday: true,
      },
    });

    return {
      today: {
        api_calls: this.statObj(usage.apiCallsToday, limits.daily_api_calls),
        visitors: this.statObj(usage.visitorsToday, limits.daily_visitors),
        conversations: this.statObj(usage.conversationsToday, limits.daily_conversations),
      },
      month: {
        api_calls: this.statObj(monthly._sum.apiCallsToday || 0, limits.monthly_api_calls),
        visitors: this.statObj(monthly._sum.visitorsToday || 0, limits.monthly_visitors),
        conversations: this.statObj(monthly._sum.conversationsToday || 0, limits.monthly_conversations),
      },
      plan: org.plan?.name || 'Free',
      status: org.subscriptionStatus,
      trialDaysLeft: org.subscriptionStatus === 'trial' && org.trialEndDate
        ? Math.max(0, Math.ceil((org.trialEndDate.getTime() - Date.now()) / 86400000))
        : null,
    };
  }

  private statObj(used: number, limit: number) {
    return { used, limit, percent: Math.min(100, Math.round((used / limit) * 100)) };
  }

  private getLimits(org: any): any {
    if (org.subscriptionStatus === 'trial') return TRIAL_LIMITS;
    if (org.plan?.limits) return org.plan.limits;
    return FREE_LIMITS;
  }

  private checkDailyLimit(type: UsageType, usage: any, limits: any) {
    const checks: Record<UsageType, [number, number, string]> = {
      api_call:     [usage.apiCallsToday,      limits.daily_api_calls,      'Daily API call'],
      visitor:      [usage.visitorsToday,       limits.daily_visitors,       'Daily visitor'],
      conversation: [usage.conversationsToday,  limits.daily_conversations,  'Daily conversation'],
    };
    const [used, limit, label] = checks[type];
    if (used >= limit) {
      throw new ForbiddenException(
        `${label} limit reached (${limit}/day). Resets at midnight. Upgrade your plan for higher limits.`,
      );
    }
  }

  private async checkMonthlyLimit(orgId: string, type: UsageType, limits: any) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthly = await this.prisma.usageRecord.aggregate({
      where: { orgId, date: { gte: monthStart } },
      _sum: {
        apiCallsToday: true,
        visitorsToday: true,
        conversationsToday: true,
      },
    });

    const checks: Record<UsageType, [number, number, string]> = {
      api_call:     [monthly._sum.apiCallsToday || 0,      limits.monthly_api_calls,      'Monthly API call'],
      visitor:      [monthly._sum.visitorsToday || 0,      limits.monthly_visitors,       'Monthly visitor'],
      conversation: [monthly._sum.conversationsToday || 0, limits.monthly_conversations,  'Monthly conversation'],
    };

    const [used, limit, label] = checks[type];
    if (used >= limit) {
      throw new ForbiddenException(
        `${label} limit reached (${limit}/month). Resets next month. Upgrade your plan.`,
      );
    }
  }

  private async getOrCreateUsage(orgId: string, date: Date) {
    const existing = await this.prisma.usageRecord.findUnique({
      where: { orgId_date: { orgId, date } },
    });

    if (existing) return existing;

    return this.prisma.usageRecord.create({
      data: {
        orgId, date,
        apiCallsToday: 0, visitorsToday: 0, conversationsToday: 0,
        apiCallsMonth: 0, visitorsMonth: 0, conversationsMonth: 0,
      },
    });
  }

  private async incrementUsage(orgId: string, date: Date, type: UsageType) {
    await this.prisma.usageRecord.update({
      where: { orgId_date: { orgId, date } },
      data: {
        apiCallsToday:      type === 'api_call'     ? { increment: 1 } : undefined,
        visitorsToday:      type === 'visitor'      ? { increment: 1 } : undefined,
        conversationsToday: type === 'conversation' ? { increment: 1 } : undefined,
      },
    });
  }

  private getTodayDate(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
}