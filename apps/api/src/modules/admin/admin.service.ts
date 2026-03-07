import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) { }

  // ── STATS OVERVIEW ─────────────────────────────────
  async getStats() {
    const [
      totalOrgs,
      activeOrgs,
      totalUsers,
      totalConversations,
      totalKnowledgeSources,
      totalMessages,
    ] = await Promise.all([
      this.prisma.organization.count(),
      this.prisma.organization.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count(),
      this.prisma.conversation.count(),
      this.prisma.knowledgeSource.count({ where: { status: 'READY' } }),
      this.prisma.message.count(),
    ]);

    return {
      totalOrgs,
      activeOrgs,
      suspendedOrgs: totalOrgs - activeOrgs,
      totalUsers,
      totalConversations,
      totalKnowledgeSources,
      totalMessages,
    };
  }

  // ── LIST ALL ORGANIZATIONS ──────────────────────────
  async getAllOrganizations(page: number, limit: number, search: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { slug: { contains: search, mode: 'insensitive' as const } },
        ],
      }
      : {};

    const [orgs, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          plan: { select: { name: true, priceMonthly: true } },
          _count: {
            select: {
              users: true,
              knowledgeSources: true,
              conversations: true,
            },
          },
        },
      }),
      this.prisma.organization.count({ where }),
    ]);

    // Enrich with computed fields
    const enriched = orgs.map((org) => {
      const now = new Date();

      // Trial days left
      let trialDaysLeft: number | null = null;
      if (org.subscriptionStatus === 'trial' && org.trialEndDate) {
        trialDaysLeft = Math.max(
          0,
          Math.ceil((org.trialEndDate.getTime() - now.getTime()) / 86400000),
        );
        // Auto-mark expired
        if (trialDaysLeft === 0 && now > org.trialEndDate) {
          trialDaysLeft = 0;
        }
      }

      // Period days left
      let periodDaysLeft: number | null = null;
      if (org.subscriptionStatus === 'active' && org.currentPeriodEnd) {
        periodDaysLeft = Math.max(
          0,
          Math.ceil(
            (org.currentPeriodEnd.getTime() - now.getTime()) / 86400000,
          ),
        );
      }

      // Display plan name
      let displayPlan = 'Free';
      if (org.subscriptionStatus === 'trial') displayPlan = 'Trial (Starter limits)';
      else if (org.subscriptionStatus === 'active') displayPlan = org.plan?.name || 'Unknown';
      else if (org.subscriptionStatus === 'cancelled') displayPlan = `${org.plan?.name || ''} (Cancelled)`;
      else if (org.subscriptionStatus === 'expired') displayPlan = 'Expired';
      else if (org.subscriptionStatus === 'none') displayPlan = 'Free';

      return {
        ...org,
        displayPlan,
        trialDaysLeft,
        periodDaysLeft,
        monthlyRevenue:
          org.subscriptionStatus === 'active'
            ? Number(org.plan?.priceMonthly || 0)
            : 0,
      };
    });

    return {
      data: enriched,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ── GET SINGLE ORG DETAIL ───────────────────────────
  async getOrganizationById(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        plan: true,
        users: {
          select: {
            id: true,
            email: true,
            role: true,
            isVerified: true,
            lastLogin: true,
            createdAt: true,
          },
        },
        knowledgeSources: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            chunkCount: true,
            createdAt: true,
          },
        },
        conversations: {
          orderBy: { startedAt: 'desc' },
          take: 10,
          select: {
            id: true,
            sessionId: true,
            startedAt: true,
            _count: { select: { messages: true } },
          },
        },
        _count: {
          select: {
            users: true,
            knowledgeSources: true,
            conversations: true,
          },
        },
      },
    });

    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  // ── SUSPEND ORG ─────────────────────────────────────
  async suspendOrganization(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
    });
    if (!org) throw new NotFoundException('Organization not found');

    return this.prisma.organization.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });
  }

  // ── ACTIVATE ORG ────────────────────────────────────
  async activateOrganization(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
    });
    if (!org) throw new NotFoundException('Organization not found');

    return this.prisma.organization.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
  }

  // ── DELETE ORG ──────────────────────────────────────
  async deleteOrganization(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
    });
    if (!org) throw new NotFoundException('Organization not found');

    await this.prisma.organization.delete({ where: { id } });
    return { message: 'Organization deleted successfully' };
  }
}