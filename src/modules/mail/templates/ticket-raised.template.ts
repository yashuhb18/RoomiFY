import { baseEmailTemplate } from './base.template';

export function ticketRaisedStudentTemplate(
  studentName: string,
  ticketId: string,
  category: string,
  description: string,
  slaDeadline: string,
  breachRisk: boolean,
): string {
  const content = `
    <p class="greeting">Hi ${studentName || 'there'},</p>
    <h1>🎫 Your Support Ticket Has Been Raised</h1>
    <p>
      We've received your maintenance request. Our hostel operations team has been
      notified and your ticket is now being tracked under our SLA monitoring system.
    </p>

    <div class="highlight-box">
      <p><span class="highlight-label">Ticket ID</span></p>
      <p><span class="highlight-value" style="font-family: monospace; font-size: 13px;">${ticketId.slice(0, 8).toUpperCase()}</span></p>
      <div class="divider"></div>
      <p><span class="highlight-label">Category</span></p>
      <p><span class="highlight-value">${category}</span></p>
      <div class="divider"></div>
      <p><span class="highlight-label">Description</span></p>
      <p><span class="highlight-value" style="font-size: 13px;">${description.length > 200 ? description.slice(0, 200) + '...' : description}</span></p>
      <div class="divider"></div>
      <p><span class="highlight-label">SLA Resolution Deadline</span></p>
      <p><span class="highlight-value">${new Date(slaDeadline).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span></p>
      <div class="divider"></div>
      <p><span class="highlight-label">Priority Status</span></p>
      <p>
        <span class="status-badge ${breachRisk ? 'status-open' : ''}" 
              style="${breachRisk ? 'background-color: #FEE2E2; color: #991B1B;' : 'background-color: #FEF3C7; color: #92400E;'}">
          ${breachRisk ? '⚠ HIGH RISK — SLA BREACH PREDICTED' : 'NORMAL — WITHIN SLA'}
        </span>
      </p>
    </div>

    <p>
      You will receive an email notification once your ticket has been resolved.
      You can also track the status of your ticket in real-time from your
      <strong>Tickets Dashboard</strong>.
    </p>

    <div style="text-align: center; margin: 32px 0 16px;">
      <a href="http://localhost:3000/student/tickets" class="cta-button">View My Tickets →</a>
    </div>
  `;

  return baseEmailTemplate(content, `Ticket ${ticketId.slice(0, 8).toUpperCase()} raised for ${category}. SLA tracking active.`);
}

export function ticketRaisedWardenTemplate(
  studentEmail: string,
  ticketId: string,
  category: string,
  description: string,
  slaDeadline: string,
  breachRisk: boolean,
): string {
  const content = `
    <p class="greeting">Warden Notification 🚨</p>
    <h1>New Support Ticket Raised</h1>
    <p>
      A resident has submitted a new maintenance ticket in your hostel. Please review
      and assign staff for timely resolution.
    </p>

    <div class="highlight-box">
      <p><span class="highlight-label">Ticket ID</span></p>
      <p><span class="highlight-value" style="font-family: monospace; font-size: 13px;">${ticketId.slice(0, 8).toUpperCase()}</span></p>
      <div class="divider"></div>
      <p><span class="highlight-label">Reported By</span></p>
      <p><span class="highlight-value">${studentEmail}</span></p>
      <div class="divider"></div>
      <p><span class="highlight-label">Category</span></p>
      <p><span class="highlight-value">${category}</span></p>
      <div class="divider"></div>
      <p><span class="highlight-label">Description</span></p>
      <p><span class="highlight-value" style="font-size: 13px;">${description.length > 200 ? description.slice(0, 200) + '...' : description}</span></p>
      <div class="divider"></div>
      <p><span class="highlight-label">SLA Deadline</span></p>
      <p><span class="highlight-value">${new Date(slaDeadline).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span></p>
      <div class="divider"></div>
      <p><span class="highlight-label">Breach Risk</span></p>
      <p>
        <span class="status-badge" 
              style="${breachRisk ? 'background-color: #FEE2E2; color: #991B1B;' : 'background-color: #D1FAE5; color: #065F46;'}">
          ${breachRisk ? '⚠ HIGH RISK — IMMEDIATE ATTENTION REQUIRED' : '✓ NORMAL — WITHIN SLA WINDOW'}
        </span>
      </p>
    </div>

    <div style="text-align: center; margin: 32px 0 16px;">
      <a href="http://localhost:3000/warden/tickets" class="cta-button">Open Warden Ticket Console →</a>
    </div>
  `;

  return baseEmailTemplate(content, `[WARDEN ALERT] New ${category} ticket from ${studentEmail}. ${breachRisk ? 'SLA BREACH RISK.' : ''}`);
}
