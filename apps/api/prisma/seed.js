import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...\n');

  const plans = [
    {
      name: 'Free',
      priceMonthly: 0,
      priceYearly: 0,
      limits: {
        daily_api_calls: 50,
        daily_conversations: 15,
        daily_visitors: 50,
        monthly_api_calls: 500,
        monthly_conversations: 300,
        monthly_visitors: 500,
        kb_size_mb: 10,
        messages_per_conversation: 5,
        custom_domain: false,
        remove_branding: false,
      },
    },
    {
      name: 'Starter',
      priceMonthly: 1499,
      priceYearly: 14990,
      limits: {
        daily_api_calls: 400,
        daily_conversations: 70,
        daily_visitors: 200,
        monthly_api_calls: 10000,
        monthly_conversations: 2000,
        monthly_visitors: 5000,
        kb_size_mb: 100,
        messages_per_conversation: 20,
        custom_domain: false,
        remove_branding: false,
      },
    },
    {
      name: 'Pro',
      priceMonthly: 3999,
      priceYearly: 39990,
      limits: {
        daily_api_calls: 3500,
        daily_conversations: 500,
        daily_visitors: 900,
        monthly_api_calls: 100000,
        monthly_conversations: 15000,
        monthly_visitors: 25000,
        kb_size_mb: 500,
        messages_per_conversation: 50,
        custom_domain: true,
        remove_branding: false,
      },
    },
    {
      name: 'Business',
      priceMonthly: 11999,
      priceYearly: 119990,
      limits: {
        daily_api_calls: 10000,
        daily_conversations: 2500,
        daily_visitors: 3500,
        monthly_api_calls: 300000,
        monthly_conversations: 75000,
        monthly_visitors: 100000,
        kb_size_mb: 2000,
        messages_per_conversation: 100,
        custom_domain: true,
        remove_branding: true,
      },
    },
    {
      name: 'Enterprise',
      priceMonthly: 0,
      priceYearly: 0,
      limits: {
        daily_api_calls: 999999,
        daily_conversations: 999999,
        daily_visitors: 999999,
        monthly_api_calls: 999999,
        monthly_conversations: 999999,
        monthly_visitors: 999999,
        kb_size_mb: 10000,
        messages_per_conversation: 999,
        custom_domain: true,
        remove_branding: true,
      },
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
    console.log(`✅ Plan: ${plan.name} — ₹${plan.priceMonthly}/month`);
  }

  // Super Admin
  const existing = await prisma.user.findFirst({
    where: { email: 'admin@fluxypy.com' },
  });

  if (!existing) {
    const freePlan = await prisma.subscriptionPlan.findFirst({
      where: { name: 'Free' },
    });

    const org = await prisma.organization.upsert({
      where: { slug: 'fluxypy-admin' },
      update: {},
      create: {
        name: 'Fluxypy Admin',
        slug: 'fluxypy-admin',
        apiKey: 'fpy_admin_internal_key',
        planId: freePlan?.id,
        subscriptionStatus: 'active',
        settings: {},
      },
    });

    const hash = await bcrypt.hash('22feb@AnshAnup', 12);
    await prisma.user.create({
      data: {
        orgId: org.id,
        email: 'admin@fluxypy.com',
        passwordHash: hash,
        role: 'SUPER_ADMIN',
        isVerified: true
      },
    });
    console.log('\n✅ Super admin created!');
  } else {
    console.log('\nℹ️ Super admin already exists');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Free       → ₹0       | 50 calls/day');
  console.log('Starter    → ₹1,499   | 400 calls/day');
  console.log('Pro        → ₹3,999   | 3500 calls/day');
  console.log('Business   → ₹11,999  | 10000 calls/day');
  console.log('Enterprise → Custom   | Unlimited');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Seeding complete!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());