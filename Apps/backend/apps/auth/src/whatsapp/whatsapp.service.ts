import axios from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WhatsappService {
  private instanceId = process.env.ULTRA_INSTANCE_ID;
  private token = process.env.ULTRA_TOKEN;

  async sendOtp(phone: string, otp: string) {
    try {
      const url = `https://api.ultramsg.com/${this.instanceId}/messages/chat?token=${this.token}`;
      const response = await axios.post(
        url,
        { to: phone, body: `Your OTP is: ${otp}` },
        { headers: { 'Content-Type': 'application/json' } },
      );
      console.log('✅ OTP sent:', response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Axios error response:', error.response?.data);
      } else {
        console.error('❌ Unexpected error:', error);
      }
      throw error;
    }
  }
}
