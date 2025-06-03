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
    @Inject('DOCTOR_SERVICE_CLIENT')
    private readonly doctorServiceClient: ClientProxy,
  ) {}

  async handleRequest(
    client: ClientProxy,
    pattern: any,
    body: any,
    fallbackMsg: string,
  ) {
    try {
      const result = await lastValueFrom(client.send(pattern, body));
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
    return this.handleRequest(
      this.authServiceClient,
      { cmd: 'login_user' },
      body,
      'Login failed',
    );
  }

  @Post('register')
  async register(@Body() body: any) {
    try {
      // First register the user in auth service
      const userResult = await this.handleRequest(
        this.authServiceClient,
        { cmd: 'register_user' },
        body,
        'Registration failed',
      );

      // If user is a doctor, the auth service already emits to doctor service
      // So we just return the auth result
      return userResult;
    } catch (error) {
      throw error;
    }
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: any) {
    return this.handleRequest(
      this.authServiceClient,
      { cmd: 'refresh_token' },
      body,
      'Token refresh failed',
    );
  }

  @Post('logout')
  async logout(@Body() body: { userId: string }) {
    return this.handleRequest(
      this.authServiceClient,
      { cmd: 'logout_user' },
      body,
      'Logout failed',
    );
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: any) {
    return this.handleRequest(
      this.authServiceClient,
      { cmd: 'verify_otp' },
      body,
      'OTP verification failed',
    );
  }

  // ==================== DOCTOR-SPECIFIC AUTH ENDPOINTS ====================
  @Post('doctor/complete-profile')
  async completeDoctorProfile(
    @Body()
    body: {
      userId: string;
      consultation_fee?: number;
      available_days?: string[];
      start_time?: string;
      end_time?: string;
    },
  ) {
    return this.handleRequest(
      this.doctorServiceClient,
      { cmd: 'update_doctor_profile' },
      { userId: body.userId, updates: body },
      'Failed to complete doctor profile',
    );
  }

  @Post('doctor/check-profile')
  async checkDoctorProfile(@Body() body: { userId: string }) {
    try {
      const doctor = await this.handleRequest(
        this.doctorServiceClient,
        { cmd: 'get_doctor_by_user_id' },
        body,
        'Doctor profile not found',
      );
      return { exists: true, doctor };
    } catch (error) {
      if (error.status === 404) {
        return { exists: false };
      }
      throw error;
    }
  }
}
