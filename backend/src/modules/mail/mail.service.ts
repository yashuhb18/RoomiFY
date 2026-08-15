import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { welcomeEmailTemplate } from './templates/welcome.template';
import {
  ticketRaisedStudentTemplate,
  ticketRaisedWardenTemplate,
} from './templates/ticket-raised.template';
import { ticketResolvedTemplate } from './templates/ticket-resolved.template';
import { passwordResetEmailTemplate } from './templates/password-reset.template';
import { wardenConcernTemplate } from './templates/warden-concern.template';
import {
  roomRequestSubmittedTemplate,
  roomAllocatedTemplate,
} from './templates/room-allocation.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private readonly fromAddress: string;
  private readonly isConfigured: boolean;

  constructor(private readonly configService: ConfigService) {
    const mailUser = this.configService.get<string>('mail.user');
    const mailPassword = this.configService.get<string>('mail.password');
    this.fromAddress = this.configService.get<string>('mail.from') || '"RoomiFY" <roomify.org@gmail.com>';

    if (mailUser && mailPassword) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: mailUser,
          pass: mailPassword,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      this.isConfigured = true;
      this.logger.log(`✉️  Mail transporter configured with Gmail Service (sender: ${mailUser})`);
    } else {
      this.isConfigured = false;
      this.logger.warn(
        '⚠️  Mail transporter NOT configured. Set MAIL_USER and MAIL_PASSWORD in .env to enable email notifications.',
      );
    }
  }

  private async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      this.logger.warn(`📧 Mail skipped (not configured): "${subject}" → ${to}`);
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        html,
      });

      this.logger.log(`📧 Email sent: "${subject}" → ${to} (messageId: ${info.messageId})`);
      return true;
    } catch (error) {
      this.logger.error(
        `📧 Failed to send email: "${subject}" → ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }

  // ─── Account Created (Welcome Email) ──────────────────────────────
  async sendWelcomeEmail(email: string, fullName?: string): Promise<boolean> {
    const html = welcomeEmailTemplate(fullName || '', email);
    return this.sendMail(
      email,
      '🏠 Welcome to RoomiFY — Your Smart Hostel Awaits!',
      html,
    );
  }

  // ─── Ticket Raised (Student Confirmation) ─────────────────────────
  async sendTicketRaisedEmail(
    studentEmail: string,
    studentName: string,
    ticketId: string,
    category: string,
    description: string,
    slaDeadline: string,
    breachRisk: boolean,
  ): Promise<boolean> {
    const html = ticketRaisedStudentTemplate(
      studentName,
      ticketId,
      category,
      description,
      slaDeadline,
      breachRisk,
    );
    return this.sendMail(
      studentEmail,
      `🎫 Ticket Raised: ${category} — ${ticketId.slice(0, 8).toUpperCase()}`,
      html,
    );
  }

  // ─── Ticket Raised (Warden Alert) ─────────────────────────────────
  async sendTicketRaisedWardenAlert(
    wardenEmail: string,
    studentEmail: string,
    ticketId: string,
    category: string,
    description: string,
    slaDeadline: string,
    breachRisk: boolean,
  ): Promise<boolean> {
    const html = ticketRaisedWardenTemplate(
      studentEmail,
      ticketId,
      category,
      description,
      slaDeadline,
      breachRisk,
    );
    return this.sendMail(
      wardenEmail,
      `🚨 [Warden Alert] New ${category} Ticket — ${ticketId.slice(0, 8).toUpperCase()}`,
      html,
    );
  }

  // ─── Ticket Resolved (Student Notification) ───────────────────────
  async sendTicketResolvedEmail(
    studentEmail: string,
    studentName: string,
    ticketId: string,
    category: string,
  ): Promise<boolean> {
    const html = ticketResolvedTemplate(studentName, ticketId, category);
    return this.sendMail(
      studentEmail,
      `✅ Ticket Resolved: ${category} — ${ticketId.slice(0, 8).toUpperCase()}`,
      html,
    );
  }

  // ─── Password Reset Email ─────────────────────────────────────────
  async sendPasswordResetEmail(email: string, otp: string, fullName?: string): Promise<boolean> {
    const html = passwordResetEmailTemplate(fullName || '', email, otp);
    return this.sendMail(
      email,
      '🔐 Password Reset Verification Code — RoomiFY',
      html,
    );
  }

  // ─── Room Request Submitted Email ────────────────────────────────
  async sendRoomRequestSubmittedEmail(
    studentEmail: string,
    studentName: string,
    roomNumber: string,
    floor: number,
    notes?: string,
  ): Promise<boolean> {
    const html = roomRequestSubmittedTemplate(studentName, roomNumber, floor, notes);
    return this.sendMail(
      studentEmail,
      `📋 Room Request Submitted — Room ${roomNumber}`,
      html,
    );
  }

  // ─── Room Allocated Confirmation Email ───────────────────────────
  async sendRoomAllocatedEmail(
    studentEmail: string,
    studentName: string,
    roomNumber: string,
    floor: number,
    bedLabel: string,
  ): Promise<boolean> {
    const html = roomAllocatedTemplate(studentName, roomNumber, floor, bedLabel);
    return this.sendMail(
      studentEmail,
      `🎉 Room Allocated Successfully — Room ${roomNumber}, ${bedLabel}`,
      html,
    );
  }

  // ─── Warden Concern Alert (SuperAdmin Email Notification) ─────────
  async sendWardenConcernAlert(
    superAdminEmail: string,
    senderName: string,
    senderEmail: string,
    senderRole: string,
    content: string,
  ): Promise<boolean> {
    const sentAt = new Date().toLocaleString();
    const html = wardenConcernTemplate(senderName, senderEmail, senderRole, content, sentAt);
    return this.sendMail(
      superAdminEmail,
      `🚨 [Warden Concern] ${senderName} (${senderRole}) raised a concern`,
      html,
    );
  }

  // ─── Student Temporary Suspension Email ───────────────────────────
  async sendStudentSuspensionEmail(
    studentEmail: string,
    studentName: string,
    isSuspended: boolean,
    reason?: string,
  ): Promise<boolean> {
    const statusText = isSuspended ? 'Temporarily Suspended' : 'Account Re-activated';
    const actionColor = isSuspended ? '#DC2626' : '#16A34A';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
        <h2 style="color: ${actionColor}; font-size: 20px;">⚠️ Account Status Update: ${statusText}</h2>
        <p>Dear <strong>${studentName || studentEmail}</strong>,</p>
        <p>This email is to notify you that your AEGIS HOSTEL student account has been <strong>${isSuspended ? 'temporarily suspended' : 're-activated'}</strong> by the Hostel Administration.</p>
        ${reason ? `<div style="background-color: #FEF2F2; padding: 12px; border-left: 4px solid ${actionColor}; margin: 15px 0;"><strong>Reason:</strong> ${reason}</div>` : ''}
        <p>${isSuspended ? 'During this period, your access to hostel facilities and active dashboard features is paused. Please contact your Warden for clarification.' : 'You may now log back into your student portal and access all features.'}</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6B7280;">AEGIS HOSTEL Management System — Disciplinary Operations</p>
      </div>
    `;
    return this.sendMail(
      studentEmail,
      `⚠️ [Notice] Account ${statusText} — AEGIS HOSTEL`,
      html,
    );
  }

  // ─── Student Eviction Notification Email ──────────────────────────
  async sendStudentEvictionEmail(
    studentEmail: string,
    studentName: string,
    evictionReason?: string,
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EF4444; border-radius: 8px;">
        <h2 style="color: #DC2626; font-size: 22px;">🚫 Official Notice: Permanent Hostel Eviction</h2>
        <p>Dear <strong>${studentName || studentEmail}</strong>,</p>
        <p>You are hereby notified that your hostel allotment and student account have been <strong>permanently revoked and evicted</strong> by the Super Admin.</p>
        <div style="background-color: #FEF2F2; padding: 15px; border-left: 4px solid #DC2626; margin: 15px 0;">
          <strong>Eviction Reason:</strong> ${evictionReason || 'Physical violation & serious hostel rule breach'}
        </div>
        <p>Your room allocation has been cancelled, bed released, and system access permanently terminated. You are required to complete check-out procedures with the Warden immediately.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6B7280;">AEGIS HOSTEL Super Administration Authority</p>
      </div>
    `;
    return this.sendMail(
      studentEmail,
      '🚫 OFFICIAL NOTICE: Permanent Hostel Eviction — AEGIS HOSTEL',
      html,
    );
  }
}

