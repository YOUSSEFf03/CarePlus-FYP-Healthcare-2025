import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'fyphealthcare2025@gmail.com',
      pass: process.env.EMAIL_PASS || 'zyfc akaa yfkr wmlv',
    },
  });

  async sendOTP(to: string, otp: string) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER || 'fyphealthcare2025@gmail.com',
      to,
      subject: 'Verify your email',
      html: `<p>Your verification code is: <strong>${otp}</strong></p>`,
    });
  }
}
