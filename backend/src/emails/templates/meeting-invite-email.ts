export function getMeetingInviteEmailHtml(params: {
  studentName: string;
  meetingTitle: string;
  instructorName: string;
  scheduledAt: string;
  passcode: string;
  joinUrl: string;
}) {
  const {
    studentName,
    meetingTitle,
    instructorName,
    scheduledAt,
    passcode,
    joinUrl,
  } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meeting Invitation</title>
</head>
<body style="background-color: #f3f4f6; margin: 0; padding:0px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1e3a8a; padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700; letter-spacing: 1px;">NeuroMeet</h1>
              <p style="color: #93c5fd; font-size: 14px; margin: 8px 0 0 0; letter-spacing: 0.5px;">Meeting Invitation</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 50px 15px;">
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 0;">
                Hi <strong>${studentName}</strong>,
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                You have been invited to a meeting session on NeuroMeet.
              </p>

              <!-- Meeting Details Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Meeting</td>
                    <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${meetingTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Instructor</td>
                    <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${instructorName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Scheduled At</td>
                    <td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${scheduledAt}</td>
                  </tr>
                </table>
              </div>

              <!-- Passcode Box -->
              <div style="background-color: #eff6ff; border: 2px solid #bfdbfe; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Your Meeting Passcode</p>
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #1e40af;">${passcode}</span>
              </div>

              <!-- Join Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${joinUrl}" style="display: inline-block; background-color: #1e3a8a; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 40px; border-radius: 8px;">
                      Join Meeting
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin-top: 24px;">
                If the meeting hasn't started yet, you will see a waiting screen. Once the instructor starts the session, you can enter your passcode and join.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} NeuroMeet. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
