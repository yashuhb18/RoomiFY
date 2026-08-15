import { baseEmailTemplate } from './base.template';

export function ticketResolvedTemplate(
  studentName: string,
  ticketId: string,
  category: string,
): string {
  const content = `
    <p class="greeting">Hi ${studentName || 'there'},</p>
    <h1>✅ Your Ticket Has Been Resolved</h1>
    <p>
      Great news! Your support ticket has been successfully resolved by the
      hostel maintenance team. We hope the issue has been addressed to your satisfaction.
    </p>

    <div class="highlight-box">
      <p><span class="highlight-label">Ticket ID</span></p>
      <p><span class="highlight-value" style="font-family: monospace; font-size: 13px;">${ticketId.slice(0, 8).toUpperCase()}</span></p>
      <div class="divider"></div>
      <p><span class="highlight-label">Category</span></p>
      <p><span class="highlight-value">${category}</span></p>
      <div class="divider"></div>
      <p><span class="highlight-label">Status</span></p>
      <p><span class="status-badge status-resolved">✓ RESOLVED</span></p>
      <div class="divider"></div>
      <p><span class="highlight-label">Resolved On</span></p>
      <p><span class="highlight-value">${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span></p>
    </div>

    <p>
      If the issue persists or you're not satisfied with the resolution,
      you can raise a follow-up ticket from your dashboard.
    </p>

    <div style="text-align: center; margin: 32px 0 16px;">
      <a href="http://localhost:3000/student/tickets" class="cta-button">View Ticket History →</a>
    </div>

    <div class="divider"></div>

    <p style="font-size: 13px; color: #94A3B8;">
      Thank you for helping us maintain a comfortable living environment.
      Your feedback drives continuous improvement at RoomiFY.
    </p>
  `;

  return baseEmailTemplate(content, `Your ${category} ticket (${ticketId.slice(0, 8).toUpperCase()}) has been resolved.`);
}
