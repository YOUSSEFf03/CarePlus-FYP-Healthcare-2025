import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsappService {
  private instanceId = process.env.ULTRA_INSTANCE_ID || 'your_instance_id_here';
  private token = process.env.ULTRA_TOKEN || 'your_token_here';
  private fromNumber = '+96171247781'; // Your WhatsApp number

  async sendMessage(
    phone: string,
    message: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const url = `https://api.ultramsg.com/${this.instanceId}/messages/chat?token=${this.token}`;

      const response = await axios.post(
        url,
        { 
          to: phone, 
          body: message,
          from: this.fromNumber
        },
        { headers: { 'Content-Type': 'application/json' } },
      );

      console.log('✅ WhatsApp message sent:', response.data);
      return {
        success: true,
        messageId: response.data.id || response.data.sent,
      };
    } catch (error) {
      console.error('❌ WhatsApp sending failed:', error);

      let errorMessage = 'Unknown error';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async sendOtp(
    phone: string,
    otp: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message = `Your OTP is: ${otp}`;
    return this.sendMessage(phone, message);
  }
}
