export const getPasswordResetConfirmationEmailHtml = (
  userEmail: string,
  loginUrl: string = 'http://localhost:3000/sign-in',
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed – NeuroMeet</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0f14;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0d0f14;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#0e1a2b 0%,#111827 100%);border-radius:16px 16px 0 0;padding:28px 32px 24px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.07);">
              <div style="display:inline-block;background:linear-gradient(90deg,#00d2ff,#7e57c2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:24px;font-weight:800;letter-spacing:-0.5px;margin-bottom:4px;">NeuroMeet</div>
              <div style="color:#6b7280;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Security Alert</div>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background-color:#111827;padding:32px 32px 28px;">

              <!-- SUCCESS BADGE -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.25);border-radius:100px;padding:6px 16px;">
                      <span style="color:#34d399;font-size:13px;font-weight:600;">&#10003; Password changed successfully</span>
                    </div>
                  </td>
                </tr>
              </table>

              <h1 style="color:#f9fafb;font-size:20px;font-weight:700;margin:0 0 12px;line-height:1.3;">Your password has been updated</h1>
              <p style="color:#9ca3af;font-size:15px;line-height:1.65;margin:0 0 24px;">
                Hi <strong style="color:#e5e7eb;">${userEmail}</strong>, your NeuroMeet account password was successfully changed. You can now sign in with your new credentials.
              </p>

              <!-- CTA -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(90deg,#1a768d,#7c3aed);color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:100px;font-size:15px;font-weight:600;letter-spacing:0.2px;">
                      Sign in to NeuroMeet
                    </a>
                  </td>
                </tr>
              </table>

              <!-- WARNING -->
              <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.20);border-radius:10px;padding:14px 18px;">
                <p style="color:#fbbf24;font-size:13px;font-weight:600;margin:0 0 4px;">Didn't make this change?</p>
                <p style="color:#9ca3af;font-size:13px;line-height:1.6;margin:0;">
                  If you did not change your password, please contact our support team immediately. Your account may be at risk.
                </p>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#0d0f14;border-radius:0 0 16px 16px;padding:18px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="color:#4b5563;font-size:12px;margin:0;line-height:1.6;">
                &copy; ${new Date().getFullYear()} NeuroMeet. All rights reserved.<br>
                This is an automated security alert — please do not reply.
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
