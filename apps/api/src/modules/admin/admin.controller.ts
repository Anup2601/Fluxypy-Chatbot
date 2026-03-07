import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { TrialSecurityService } from '../billing/trial-security.service';
import { EmailService } from '../../common/services/email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private trialSecurity: TrialSecurityService,
    private email: EmailService,
  ) {}

  // ── Stats ───────────────────────────────────────
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // ── Organizations ───────────────────────────────
  @Get('organizations')
  getAllOrganizations(
    @Query('page') page: number = 1,
    @Query('search') search: string = '',
  ) {
    return this.adminService.getAllOrganizations(Number(page), 20, search);
  }

  @Get('organizations/:id')
  getOrganization(@Param('id') id: string) {
    return this.adminService.getOrganizationById(id);
  }

  @Post('organizations/:id/suspend')
  suspendOrganization(@Param('id') id: string) {
    return this.adminService.suspendOrganization(id);
  }

  @Post('organizations/:id/activate')
  activateOrganization(@Param('id') id: string) {
    return this.adminService.activateOrganization(id);
  }

  @Delete('organizations/:id')
  deleteOrganization(@Param('id') id: string) {
    return this.adminService.deleteOrganization(id);
  }

  // ── Trial Requests ──────────────────────────────
  @Get('trial-requests')
  getTrialRequests(@Query('page') page: number = 1) {
    return this.trialSecurity.getPendingRequests(Number(page));
  }

  @Post('trial-requests/:id/approve')
  async approveTrialRequest(
    @Param('id') id: string,
    @CurrentUser('id') adminUserId: string,
  ) {
    const result = await this.trialSecurity.approveRequest(id, adminUserId);
    if (result.adminEmail) {
      await this.email.sendTrialApproved(
        result.adminEmail,
        result.orgName,
        result.trialEndDate,
      );
    }
    return result;
  }

  @Post('trial-requests/:id/reject')
  async rejectTrialRequest(
    @Param('id') id: string,
    @CurrentUser('id') adminUserId: string,
    @Body('reason') reason: string,
  ) {
    const result = await this.trialSecurity.rejectRequest(id, adminUserId, reason);
    if (result.adminEmail) {
      await this.email.sendTrialRejected(
        result.adminEmail,
        result.orgName,
        reason,
      );
    }
    return result;
  }
}