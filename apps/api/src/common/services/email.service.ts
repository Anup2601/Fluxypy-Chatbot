import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST') || 'smtp.zoho.in',
      port: parseInt(this.config.get('SMTP_PORT') || '587'),
      secure: false,
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  // ── Trial Request Submitted ─────────────────────
  async sendTrialRequestSubmitted(email: string, orgName: string) {
    await this.send(email, '⏳ Trial Request Submitted — Fluxypy Bot', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #6366F1; padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">Request Received! 🎉</h1>
        </div>
        <div style="padding: 32px; background: white; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151;">Hi <strong>${orgName}</strong>,</p>
          <p style="color: #6B7280;">Your 30-day trial request has been submitted successfully.</p>
          <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #1E40AF;">
              ⏳ Our team will review your request within <strong>24 hours</strong>.
              You'll receive an email once approved!
            </p>
          </div>
          <p style="color: #6B7280; font-size: 14px;">
            Meanwhile, you can continue using the Free plan.
          </p>
        </div>
      </div>
    `);
  }

  // ── Trial Approved ──────────────────────────────
  async sendTrialApproved(email: string, orgName: string, trialEndDate: Date) {
    const endDateStr = trialEndDate.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    await this.send(email, '🎉 Trial Approved — 30 Days Free Access!', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10B981; padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">Trial Approved! 🚀</h1>
        </div>
        <div style="padding: 32px; background: white; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151;">Hi <strong>${orgName}</strong>,</p>
          <p style="color: #6B7280;">Your 30-day free trial has been <strong>approved and activated!</strong></p>
          <div style="background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #166534;">
              ✅ Trial active until: <strong>${endDateStr}</strong><br/>
              📦 Plan: <strong>Starter features</strong><br/>
              🔥 API Calls: <strong>100/day</strong>
            </p>
          </div>
          <a href="${this.config.get('FRONTEND_URL')}/dashboard" 
             style="display:inline-block;background:#6366F1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
            Go to Dashboard →
          </a>
        </div>
      </div>
    `);
  }

  // ── Trial Rejected ──────────────────────────────
  async sendTrialRejected(email: string, orgName: string, reason?: string) {
    await this.send(email, '❌ Trial Request Not Approved', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #EF4444; padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">Request Not Approved</h1>
        </div>
        <div style="padding: 32px; background: white; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151;">Hi <strong>${orgName}</strong>,</p>
          <p style="color: #6B7280;">Unfortunately your trial request was not approved.</p>
          ${reason ? `<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:16px;margin:24px 0;">
            <p style="margin:0;color:#991B1B;">Reason: ${reason}</p>
          </div>` : ''}
          <p style="color: #6B7280;">You can still use the Free plan or directly subscribe to a paid plan.</p>
          <a href="${this.config.get('FRONTEND_URL')}/dashboard/billing" 
             style="display:inline-block;background:#6366F1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
            View Plans →
          </a>
        </div>
      </div>
    `);
  }

  // ── Trial Expiring Soon ─────────────────────────
  async sendTrialExpiringSoon(email: string, orgName: string, daysLeft: number) {
    await this.send(email, `⚠️ Trial Expires in ${daysLeft} Days!`, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #F59E0B; padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">Trial Ending Soon ⏰</h1>
        </div>
        <div style="padding: 32px; background: white; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151;">Hi <strong>${orgName}</strong>,</p>
          <p style="color: #6B7280;">Your free trial expires in <strong>${daysLeft} days</strong>!</p>
          <a href="${this.config.get('FRONTEND_URL')}/dashboard/billing"
             style="display:inline-block;background:#6366F1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
            Upgrade Now →
          </a>
        </div>
      </div>
    `);
  }

  // ── Payment Success ─────────────────────────────
  async sendPaymentSuccess(email: string, orgName: string, planName: string, amount: number) {
    await this.send(email, `✅ Payment Successful — ${planName} Plan Active!`, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10B981; padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">Payment Successful! 🎉</h1>
        </div>
        <div style="padding: 32px; background: white; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151;">Hi <strong>${orgName}</strong>,</p>
          <div style="background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; color: #166534;">
              ✅ Plan: <strong>${planName}</strong><br/>
              💰 Amount: <strong>₹${amount}</strong>
            </p>
          </div>
          <a href="${this.config.get('FRONTEND_URL')}/dashboard"
             style="display:inline-block;background:#6366F1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
            Go to Dashboard →
          </a>
        </div>
      </div>
    `);
  }

  // ── Renewal Reminder ────────────────────────────
  async sendRenewalReminder(email: string, orgName: string, planName: string, renewalDate: Date, amount: number) {
    const dateStr = renewalDate.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    await this.send(email, `🔔 Subscription Renews on ${dateStr}`, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #6366F1; padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">Renewal Reminder 🔔</h1>
        </div>
        <div style="padding: 32px; background: white; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151;">Hi <strong>${orgName}</strong>,</p>
          <p style="color: #6B7280;">
            Your <strong>${planName}</strong> plan auto-renews on 
            <strong>${dateStr}</strong> for <strong>₹${amount}</strong>.
          </p>
          <a href="${this.config.get('FRONTEND_URL')}/dashboard/billing"
             style="display:inline-block;background:#6366F1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
            Manage Subscription →
          </a>
        </div>
      </div>
    `);
  }

  // ── OTP Verification Email ──────────────────────
  async sendOtpEmail(email: string, orgName: string, otp: string) {
    await this.send(email, '🔐 Verify Your Email — Fluxypy Bot', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #6366F1; padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">Verify Your Email 🔐</h1>
        </div>
        <div style="padding: 32px; background: white; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151;">Hi <strong>${orgName}</strong>,</p>
          <p style="color: #6B7280;">Use this OTP to verify your email address:</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <div style="display: inline-block; background: #F0F0FF; border: 2px dashed #6366F1; border-radius: 12px; padding: 20px 40px;">
              <p style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #6366F1; margin: 0; font-family: monospace;">
                ${otp}
              </p>
            </div>
          </div>

          <div style="background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
            <p style="margin: 0; color: #92400E; font-size: 14px;">
              ⏰ This OTP expires in <strong>10 minutes</strong>
            </p>
          </div>

          <p style="color: #9CA3AF; font-size: 13px;">
            If you didn't create an account on Fluxypy Bot, ignore this email.
          </p>
        </div>
      </div>
    `);
  }

  private async send(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: this.config.get('SMTP_FROM') || 'Fluxypy Bot <noreply@fluxypy.ai>',
        to, subject, html,
      });
      this.logger.log(`✅ Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`❌ Email failed: ${error.message}`);
    }
  }
}