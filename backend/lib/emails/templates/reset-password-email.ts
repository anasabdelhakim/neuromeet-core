export const getResetPasswordEmailHtml = (accessToken: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="background-color: #f3f4f6; margin: 0; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1e3a8a; padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700; letter-spacing: 1px;">NeuroMeet</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 50px 40px;">
              <h2 style="color: #111827; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 24px;">Reset your password</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                We received a request to reset the password for your NeuroMeet account. Click the button below to choose a new password:
              </p>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="${accessToken}" style="background-color: #3b82f6; color: #ffffff; display: inline-block; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.3s;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
                For security reasons, this link will expire in <strong>1 hour</strong>.
              </p>
              <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin-bottom: 0;">
                If you didn't request a password reset, you can safely ignore this email. Your password will not change until you access the link above and create a new one.
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
};
