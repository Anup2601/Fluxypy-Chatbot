import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { TrialSecurityService } from './trial-security.service';
import { EmailService } from '../../common/services/email.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  controllers: [BillingController],
  providers: [BillingService, TrialSecurityService, EmailService],
  exports: [BillingService, TrialSecurityService, EmailService],
})
export class BillingModule {}