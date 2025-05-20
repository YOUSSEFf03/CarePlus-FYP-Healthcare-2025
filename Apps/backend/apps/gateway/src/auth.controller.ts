// src/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Inject,
  BadRequestException,
} from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE_CLIENT')
    private readonly authServiceClient,
  ) {}

  @Post('login')
  async login(@Body() body: any) {
    try {
      return await this.authServiceClient
        .send({ cmd: 'login_user' }, body)
        .toPromise();
    } catch (err) {
      console.error('Microservice error (login):', err?.message);
      throw new BadRequestException(err?.message || 'Login failed');
    }
  }

  @Post('register')
  async register(@Body() body: any) {
    try {
      return await this.authServiceClient
        .send({ cmd: 'register_user' }, body)
        .toPromise();
    } catch (err) {
      console.error('Microservice error (register):', err?.message);
      throw new BadRequestException(err?.message || 'Registration failed');
    }
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: any) {
    try {
      return await this.authServiceClient
        .send({ cmd: 'refresh_token' }, body)
        .toPromise();
    } catch (err) {
      console.error('Microservice error (refresh_token):', err?.message);
      throw new BadRequestException(err?.message || 'Token refresh failed');
    }
  }

  @Post('logout')
  async logout(@Body() body: { userId: string }) {
    try {
      return await this.authServiceClient
        .send({ cmd: 'logout_user' }, body)
        .toPromise();
    } catch (err) {
      console.error('Microservice error (logout):', err?.message);
      throw new BadRequestException(err?.message || 'Logout failed');
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: any) {
    try {
      return await this.authServiceClient
        .send({ cmd: 'verify_otp' }, body)
        .toPromise();
    } catch (err) {
      console.error('Microservice error (verify_otp):', err?.message);
      throw new BadRequestException(err?.message || 'OTP verification failed');
    }
  }
}
