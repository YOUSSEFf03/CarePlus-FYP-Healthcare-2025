import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendOTP(to: string, otp: string) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Verify your email',
      html: `<p>Your verification code is: <strong>${otp}</strong></p>`,
    });
  }
}
