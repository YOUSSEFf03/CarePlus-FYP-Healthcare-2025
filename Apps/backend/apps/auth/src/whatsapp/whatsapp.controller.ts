import { Controller, Post, Body } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('send-otp')
  async sendOtp(@Body() body: { phone: string }) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.whatsappService.sendOtp(body.phone, otp);
    return { message: 'OTP sent', otp }; // Don't return OTP in production
  }
}
