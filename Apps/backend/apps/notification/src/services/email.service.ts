// src/services/email.service.ts - FIXED VERSION
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    // ← FIXED: createTransport (not createTransporter)
    service: 'gmail',
    auth: {
      user: 'fyphealthcare2025@gmail.com',
      pass: process.env.EMAIL_PASS || 'your_app_password_here', // You need to set this in your environment
    },
  });

  async sendEmail(
    to: string,
    subject: string,
    content: string,
    isHtml: boolean = true,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        [isHtml ? 'html' : 'text']: content,
      };

      const result = await this.transporter.sendMail(mailOptions);

      console.log('✅ Email sent successfully:', result.messageId);
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendOTP(
    to: string,
    otp: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = 'Verify your email';
    const content = `<p>Your verification code is: <strong>${otp}</strong></p>`;
    return this.sendEmail(to, subject, content);
  }
}
