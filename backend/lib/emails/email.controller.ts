import { EmailService } from './email.service';
import { Controller, Post, Body } from '@nestjs/common';

@Controller('send-email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  async sendEmail(@Body() body: { email: string }) {
    try {
      await this.emailService.sendWelcomeEmail(body.email);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Failed to send email' };
    }
  }
}
