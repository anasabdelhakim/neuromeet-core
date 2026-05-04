import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { getWelcomeEmailHtml } from './templates/welcome-email.template';

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY is not defined in .env file!');
      // Pass a dummy key so the server doesn't crash on startup
      this.resend = new Resend('re_dummy_key_to_prevent_crash');
    } else {
      this.resend = new Resend(apiKey);
    }
  }

  async sendWelcomeEmail(userEmail: string) {
    try {
      const htmlContent = getWelcomeEmailHtml(userEmail);

      const { data, error } = await this.resend.emails.send({
        from: 'NeuroMeet <welcome@anasdev.shop>',
        to: userEmail,
        subject: 'Welcome to NeuroMeet!',
        html: htmlContent,
      });

      // لو فيه إيرور من سيرفر Resend نفسه
      if (error) {
        this.logger.error(`❌ Resend API Error for ${userEmail}:`, error);
        throw new Error(error.name);
      }

      this.logger.log(`✅ Welcome email sent successfully to ${userEmail}`);
      return data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `❌ Failed to send email to ${userEmail}`,
        errorMessage,
      );
      throw new Error('Could not send the email');
    }
  }
}
