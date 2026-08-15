import { baseEmailTemplate } from './base.template';

export function welcomeEmailTemplate(fullName: string, email: string): string {
  const content = `
    <p class="greeting">Hello ${fullName || 'there'} 👋</p>
    <h1>Welcome to RoomiFY!</h1>
    <p>
      Your account has been successfully created. You're now part of the smartest
      hostel management platform — designed to make your campus living experience
      seamless, secure, and connected.
    </p>

    <div class="highlight-box">
      <p><span class="highlight-label">Account Email</span></p>
      <p><span class="highlight-value">${email}</span></p>
      <div class="divider"></div>
      <p><span class="highlight-label">Account Status</span></p>
      <p><span class="status-badge status-open" style="background-color: #D1FAE5; color: #065F46;">ACTIVE</span></p>
    </div>

    <h2>🏠 What You Can Do Now</h2>
    <p>
      <strong>• Explore & Book Rooms</strong> — Browse available rooms with real photos, floor plans, and amenities.<br />
      <strong>• Find Your Roommate</strong> — Our AI-powered matching engine pairs you with compatible residents.<br />
      <strong>• Raise Support Tickets</strong> — Report maintenance issues with SLA-tracked resolution.<br />
      <strong>• Student Marketplace</strong> — Buy & sell items within your hostel community.<br />
      <strong>• Direct Warden Messaging</strong> — Chat directly with your hostel warden from the Help Centre.
    </p>

    <div style="text-align: center; margin: 32px 0 16px;">
      <a href="http://localhost:3000/login" class="cta-button">Log In to RoomiFY →</a>
    </div>

    <div class="divider"></div>

    <p style="font-size: 13px; color: #94A3B8;">
      If you did not create this account, please ignore this email or contact
      our support team immediately.
    </p>
  `;

  return baseEmailTemplate(content, `Welcome to RoomiFY, ${fullName || 'new resident'}! Your account is ready.`);
}
