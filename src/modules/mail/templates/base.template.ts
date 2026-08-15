/**
 * RoomiFY Branded Base Email Template
 * Wraps email content in a consistent branded layout with logo, header, and footer.
 */
export function baseEmailTemplate(content: string, previewText: string = ''): string {
  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>RoomiFY</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #F0EDFF;
      color: #0F172A;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .email-wrapper {
      width: 100%;
      max-width: 640px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(29, 39, 134, 0.08);
    }

    .email-header {
      background: linear-gradient(135deg, #1D2786 0%, #6A4FE0 50%, #8B5CF6 100%);
      padding: 40px 40px 32px;
      text-align: center;
    }

    .logo-container {
      display: inline-block;
      margin-bottom: 8px;
    }

    .logo-text {
      font-size: 28px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.5px;
      text-decoration: none;
    }

    .logo-accent {
      color: #C4B5FD;
    }

    .header-tagline {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.75);
      font-weight: 400;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }

    .email-body {
      padding: 40px;
    }

    .email-footer {
      background-color: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      padding: 28px 40px;
      text-align: center;
    }

    .footer-text {
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.6;
    }

    .footer-brand {
      font-weight: 600;
      color: #6A4FE0;
    }

    .footer-links {
      margin-top: 12px;
    }

    .footer-links a {
      font-size: 11px;
      color: #6A4FE0;
      text-decoration: none;
      margin: 0 8px;
    }

    .footer-links a:hover {
      text-decoration: underline;
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #E2E8F0, transparent);
      margin: 24px 0;
    }

    /* Content Styles */
    h1 {
      font-size: 24px;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 16px;
      line-height: 1.3;
    }

    h2 {
      font-size: 18px;
      font-weight: 600;
      color: #1E293B;
      margin-bottom: 12px;
    }

    p {
      font-size: 15px;
      color: #475569;
      line-height: 1.7;
      margin-bottom: 16px;
    }

    .highlight-box {
      background: linear-gradient(135deg, #F0EDFF 0%, #EDE9FE 100%);
      border: 1px solid #DDD6FE;
      border-left: 4px solid #6A4FE0;
      border-radius: 12px;
      padding: 20px 24px;
      margin: 24px 0;
    }

    .highlight-box p {
      margin-bottom: 8px;
      font-size: 14px;
    }

    .highlight-box p:last-child {
      margin-bottom: 0;
    }

    .highlight-label {
      font-weight: 600;
      color: #1D2786;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .highlight-value {
      font-weight: 500;
      color: #0F172A;
    }

    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #1D2786 0%, #6A4FE0 100%);
      color: #FFFFFF !important;
      font-size: 14px;
      font-weight: 600;
      padding: 14px 32px;
      border-radius: 12px;
      text-decoration: none;
      margin: 8px 0 24px;
      box-shadow: 0 4px 14px rgba(106, 79, 224, 0.3);
    }

    .status-badge {
      display: inline-block;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 16px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-open {
      background-color: #FEF3C7;
      color: #92400E;
    }

    .status-resolved {
      background-color: #D1FAE5;
      color: #065F46;
    }

    .greeting {
      font-size: 16px;
      color: #1E293B;
      font-weight: 500;
      margin-bottom: 8px;
    }

    @media only screen and (max-width: 640px) {
      .email-wrapper { border-radius: 0 !important; }
      .email-header { padding: 28px 24px 24px !important; }
      .email-body { padding: 28px 24px !important; }
      .email-footer { padding: 20px 24px !important; }
      h1 { font-size: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F0EDFF;">
  <!-- Preview Text -->
  <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #F0EDFF;">
    ${previewText}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F0EDFF; padding: 32px 16px;">
    <tr>
      <td align="center">
        <div class="email-wrapper">
          <!-- Header -->
          <div class="email-header">
            <div class="logo-container">
              <span class="logo-text">Roomi<span class="logo-accent">FY</span></span>
            </div>
            <div class="header-tagline">Smart Hostel Management Platform</div>
          </div>

          <!-- Body -->
          <div class="email-body">
            ${content}
          </div>

          <!-- Footer -->
          <div class="email-footer">
            <p class="footer-text">
              This is an automated notification from <span class="footer-brand">RoomiFY</span>.<br />
              Please do not reply to this email directly.
            </p>
            <div class="footer-links">
              <a href="#">Help Centre</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
            <p class="footer-text" style="margin-top: 16px; font-size: 11px;">
              © ${new Date().getFullYear()} RoomiFY. All rights reserved.<br />
              Built with ♥ for smarter hostel living.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
