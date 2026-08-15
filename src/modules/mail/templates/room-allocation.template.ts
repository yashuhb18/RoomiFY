export function roomRequestSubmittedTemplate(
  studentName: string,
  roomNumber: string,
  floor: number,
  notes?: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f3fb; margin: 0; padding: 20px; color: #1e1b4b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
    <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
      <h1 style="color: #4338ca; margin: 0; font-size: 22px;">🏠 RoomiFY Student Portal</h1>
      <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Room Request Submission Confirmation</p>
    </div>

    <div style="background-color: #eef2ff; border-left: 4px solid #6366f1; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <h3 style="margin: 0; color: #3730a3; font-size: 16px;">📋 Request Received & Under Warden Review</h3>
      <p style="margin: 4px 0 0 0; color: #4338ca; font-size: 13px;">Hi ${studentName}, your request for Room ${roomNumber} is currently pending approval.</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr>
        <td style="padding: 10px; background: #f8fafc; font-weight: 600; color: #475569; width: 35%;">Requested Room:</td>
        <td style="padding: 10px; background: #f8fafc; color: #0f172a;">Room ${roomNumber} (Floor ${floor})</td>
      </tr>
      <tr>
        <td style="padding: 10px; background: #ffffff; font-weight: 600; color: #475569;">Status:</td>
        <td style="padding: 10px; background: #ffffff; color: #d97706; font-weight: 600;">PENDING WARDEN APPROVAL</td>
      </tr>
      ${notes ? `<tr><td style="padding: 10px; background: #f8fafc; font-weight: 600; color: #475569;">Notes:</td><td style="padding: 10px; background: #f8fafc; color: #0f172a;">${notes}</td></tr>` : ''}
    </table>

    <div style="text-align: center; margin-top: 24px;">
      <a href="http://localhost:3000/student/rooms" style="background: #4338ca; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 14px;">Track Request Status</a>
    </div>
  </div>
</body>
</html>
  `;
}

export function roomAllocatedTemplate(
  studentName: string,
  roomNumber: string,
  floor: number,
  bedLabel: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f3fb; margin: 0; padding: 20px; color: #1e1b4b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
    <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
      <h1 style="color: #16a34a; margin: 0; font-size: 24px;">🎉 Room Allocation Approved!</h1>
      <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Congratulations ${studentName}! Your room has been allocated.</p>
    </div>

    <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <h3 style="margin: 0; color: #15803d; font-size: 16px;">🏠 Room Allocation Details</h3>
      <p style="margin: 4px 0 0 0; color: #166534; font-size: 13px;">Your room request has been officially approved by the Warden office.</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr>
        <td style="padding: 12px; background: #f8fafc; font-weight: 600; color: #475569; width: 40%;">Allocated Room:</td>
        <td style="padding: 12px; background: #f8fafc; color: #0f172a; font-weight: 700; font-size: 16px;">Room ${roomNumber}</td>
      </tr>
      <tr>
        <td style="padding: 12px; background: #ffffff; font-weight: 600; color: #475569;">Floor Level:</td>
        <td style="padding: 12px; background: #ffffff; color: #0f172a;">Floor ${floor}</td>
      </tr>
      <tr>
        <td style="padding: 12px; background: #f8fafc; font-weight: 600; color: #475569;">Assigned Bed:</td>
        <td style="padding: 12px; background: #f8fafc; color: #16a34a; font-weight: 700;">${bedLabel}</td>
      </tr>
      <tr>
        <td style="padding: 12px; background: #ffffff; font-weight: 600; color: #475569;">Status:</td>
        <td style="padding: 12px; background: #ffffff; color: #16a34a; font-weight: 700;">CONFIRMED ALLOCATION</td>
      </tr>
    </table>

    <div style="text-align: center; margin-top: 24px;">
      <a href="http://localhost:3000/student" style="background: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 14px;">Open Student Dashboard</a>
    </div>
  </div>
</body>
</html>
  `;
}
