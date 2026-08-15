export function passwordResetEmailTemplate(name: string, email: string, otp: string): string {
  const displayName = name || email.split('@')[0];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #EDEAFD; color: #3C315B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="580" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; padding: 40px; box-shadow: 0 12px 40px rgba(60, 49, 91, 0.08); border: 1px solid #E5E4E8;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <div style="background-color: #3C315B; color: #ffffff; width: 56px; height: 56px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">
                R
              </div>
              <h1 style="margin: 16px 0 0 0; font-size: 24px; font-weight: 700; color: #3C315B; letter-spacing: -0.5px;">RoomiFY</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #6A4FE0; font-weight: 600;">Autonomous Hostel Operations Platform</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding-bottom: 30px; text-align: left;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #3C315B;">Hello ${displayName},</h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #554D74;">
                We received a request to reset the password for your account (<strong>${email}</strong>). Use the verification code below to authorize your password update:
              </p>

              <!-- OTP Box -->
              <div style="background-color: #FAF9FF; border: 2px dashed #AB9FF2; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
                <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #6A4FE0; display: block; margin-bottom: 8px;">Your 6-Digit Reset Code</span>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #3C315B;">${otp}</div>
                <span style="font-size: 11px; color: #8C84A8; display: block; margin-top: 8px;">Valid for 15 minutes · Do not share this code with anyone</span>
              </div>

              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #8C84A8;">
                If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #E5E4E8; padding-top: 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #8C84A8;">
                © 2026 RoomiFY. Enterprise Hostel Operating System.<br>
                This email was dispatched automatically from <a href="mailto:roomify.org@gmail.com" style="color: #6A4FE0; text-decoration: none;">roomify.org@gmail.com</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
