export function wardenConcernTemplate(
  senderName: string,
  senderEmail: string,
  senderRole: string,
  content: string,
  sentAt: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Warden Concern Escalation</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f3fb; margin: 0; padding: 20px; color: #1e1b4b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
    
    <!-- Header -->
    <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #f1f5f9;">
      <h1 style="color: #4338ca; margin: 0; font-size: 24px; font-weight: 700;">🏠 RoomiFY Admin Console</h1>
      <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Warden & Staff Concern Notification</p>
    </div>

    <!-- Alert Banner -->
    <div style="background-color: #eef2ff; border-left: 4px solid #6366f1; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <h3 style="margin: 0; color: #3730a3; font-size: 16px;">🚨 High Priority Concern Escalation</h3>
      <p style="margin: 4px 0 0 0; color: #4338ca; font-size: 13px;">A concern or query was submitted to the SuperAdmin workspace.</p>
    </div>

    <!-- Details Box -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr>
        <td style="padding: 10px; background: #f8fafc; font-weight: 600; color: #475569; width: 30%; border-radius: 6px 0 0 6px;">Sender:</td>
        <td style="padding: 10px; background: #f8fafc; color: #0f172a; border-radius: 0 6px 6px 0;">${senderName} (${senderEmail})</td>
      </tr>
      <tr>
        <td style="padding: 10px; background: #ffffff; font-weight: 600; color: #475569;">Role:</td>
        <td style="padding: 10px; background: #ffffff; color: #0f172a;"><span style="background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">${senderRole}</span></td>
      </tr>
      <tr>
        <td style="padding: 10px; background: #f8fafc; font-weight: 600; color: #475569; border-radius: 6px 0 0 6px;">Date & Time:</td>
        <td style="padding: 10px; background: #f8fafc; color: #0f172a; border-radius: 0 6px 6px 0;">${sentAt}</td>
      </tr>
    </table>

    <!-- Message Content Box -->
    <div style="background: #fafafa; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <h4 style="margin: 0 0 10px 0; color: #334155; font-size: 14px;">Concern Message:</h4>
      <p style="margin: 0; color: #1e293b; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${content}</p>
    </div>

    <!-- Action Callout -->
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #f1f5f9;">
      <a href="http://localhost:3000/warden" style="background: #4338ca; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 14px;">Open Admin Desk</a>
    </div>

    <!-- Footer -->
    <div style="margin-top: 32px; text-align: center; color: #94a3b8; font-size: 12px;">
      <p>RoomiFY Hostel & PG SaaS Platform • Automated System Notification</p>
    </div>
  </div>
</body>
</html>
  `;
}
