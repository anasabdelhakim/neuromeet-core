export const getVerificationEmailHtml = (
  otp: string,
  isPasswordReset: boolean = false,
) => {
  const title = isPasswordReset ? 'Reset your password' : 'Verify your email';
  const subtitle = isPasswordReset
    ? 'Password reset requested'
    : 'Complete your registration';
  const description = isPasswordReset
    ? 'You requested a password reset for your NeuroMeet account. Use the code below to proceed. This code expires in <strong>10 minutes</strong>.'
    : 'Thanks for signing up! Enter the code below to verify your email address and activate your account.';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} – NeuroMeet</title>
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
              <div style="color:#6b7280;font-size:12px;letter-spacing:1px;text-transform:uppercase;">${subtitle}</div>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background-color:#111827;padding:32px 32px 28px;">
              <h1 style="color:#f9fafb;font-size:20px;font-weight:700;margin:0 0 12px;line-height:1.3;">${title}</h1>
              <p style="color:#9ca3af;font-size:15px;line-height:1.65;margin:0 0 24px;">
                ${description}
              </p>

              <!-- OTP BOX -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:linear-gradient(135deg,rgba(0,210,255,0.08),rgba(126,87,194,0.10));border:1px solid rgba(255,255,255,0.10);border-radius:12px;padding:20px 32px;">
                      <span style="font-size:38px;font-weight:800;letter-spacing:14px;color:#e0f2fe;font-variant-numeric:tabular-nums;">${otp}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- EXPIRY NOTE -->
              <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;text-align:center;">
                Didn't request this? You can safely ignore this email — your account remains secure.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#0d0f14;border-radius:0 0 16px 16px;padding:18px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="color:#4b5563;font-size:12px;margin:0;line-height:1.6;">
                &copy; ${new Date().getFullYear()} NeuroMeet. All rights reserved.<br>
                This is an automated message — please do not reply.
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
