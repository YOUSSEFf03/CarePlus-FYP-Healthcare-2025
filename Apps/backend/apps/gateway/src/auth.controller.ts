import {
  Controller,
  Post,
  Body,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE_CLIENT')
    private readonly authServiceClient: ClientProxy,
  ) {}

  async handleRequest(pattern: any, body: any, fallbackMsg: string) {
    try {
      const result = await lastValueFrom(
        this.authServiceClient.send(pattern, body),
      );
      return result;
    } catch (err) {
      console.error('Microservice Error:', err);

      let status = err?.status || HttpStatus.BAD_REQUEST;
      if (typeof status !== 'number' || isNaN(status)) {
        status = HttpStatus.BAD_REQUEST;
      }
      const message = err?.response?.message || err?.message || fallbackMsg;
      throw new HttpException(message, status);
    }
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.handleRequest({ cmd: 'login_user' }, body, 'Login failed');
  }

  @Post('register')
  async register(@Body() body: any) {
    return this.handleRequest(
      { cmd: 'register_user' },
      body,
      'Registration failed',
    );
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: any) {
    return this.handleRequest(
      { cmd: 'refresh_token' },
      body,
      'Token refresh failed',
    );
  }

  @Post('logout')
  async logout(@Body() body: { userId: string }) {
    return this.handleRequest({ cmd: 'logout_user' }, body, 'Logout failed');
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: any) {
    return this.handleRequest(
      { cmd: 'verify_otp' },
      body,
      'OTP verification failed',
    );
  }
}
