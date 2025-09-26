import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Inject,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import { AuthenticatedRequest } from './middleware/auth.middleware';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE_CLIENT')
    private readonly authServiceClient: ClientProxy,
    @Inject('DOCTOR_SERVICE_CLIENT')
    private readonly doctorServiceClient: ClientProxy,
  ) {}

  // ==================== ADD ASSISTANT REGISTRATION TO GATEWAY ====================

  @Post('register/assistant')
  async registerAssistant(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      phone: string;
    },
  ) {
    try {
      const assistantData = {
        ...body,
        role: 'assistant', // Add assistant role
      };

      const result = await lastValueFrom(
        this.authServiceClient.send({ cmd: 'register_user' }, assistantData),
      );

      return {
        success: true,
        data: result,
        message: 'Assistant registered successfully',
      };
    } catch (error) {
      throw error;
    }
  }
  async handleRequest(
    client: ClientProxy,
    pattern: any,
    body: any,
    fallbackMsg: string,
  ) {
    try {
      const result = await lastValueFrom(
        client.send(pattern, body).pipe(
          timeout(15000), // 15 second timeout
        ),
      );
      return {
        success: true,
        data: result,
        message: 'Operation successful',
      };
    } catch (err) {
      console.error('Microservice Error:', err);

      let status = err?.status || HttpStatus.BAD_REQUEST;
      if (typeof status !== 'number' || isNaN(status)) {
        status = HttpStatus.BAD_REQUEST;
      }

      // Handle timeout errors
      if (err.name === 'TimeoutError' || err.message.includes('timeout')) {
        status = HttpStatus.GATEWAY_TIMEOUT;
      }

      // Handle connection errors
      if (
        err.message.includes('ECONNREFUSED') ||
        err.message.includes('connection')
      ) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
      }

      const message = err?.response?.message || err?.message || fallbackMsg;
      throw new HttpException(
        {
          success: false,
          status,
          message,
          error: this.getErrorName(status),
        },
        status,
      );
    }
  }

  private getErrorName(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.GATEWAY_TIMEOUT:
        return 'Gateway Timeout';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service Unavailable';
      default:
        return 'Internal Server Error';
    }
  }

  // ==================== PUBLIC ROUTES ====================

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

  @Post('verify-otp')
  async verifyOtp(@Body() body: any) {
    return this.handleRequest(
      this.authServiceClient,
      { cmd: 'verify_otp' },
      body,
      'OTP verification failed',
    );
  }

  @Post('resend-otp')
  async resendOtp(@Body() body: any) {
    return this.handleRequest(
      this.authServiceClient,
      { cmd: 'resend_otp' },
      body,
      'Failed to resend OTP',
    );
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: any) {
    return this.handleRequest(
      this.authServiceClient,
      { cmd: 'forgot_password' },
      body,
      'Failed to send reset password OTP',
    );
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    return this.handleRequest(
      this.authServiceClient,
      { cmd: 'reset_password' },
      body,
      'Failed to reset password',
    );
  }

  // ==================== PROTECTED ROUTES ====================
  // These routes require authentication middleware

  @Get('profile')
  async getProfile(@Req() req: AuthenticatedRequest) {
    return this.handleRequest(
      this.authServiceClient,
      { cmd: 'get_user_profile' },
      { token: req.token },
      'Failed to get profile',
    );
  }

  @Put('profile')
  async updateProfile(@Req() req: AuthenticatedRequest, @Body() body: any) {
    return this.handleRequest(
      this.authServiceClient,
      { cmd: 'update_user_profile' },
      { token: req.token, ...body },
      'Failed to update profile',
    );
  }

  @Put('change-password')
  async changePassword(@Req() req: AuthenticatedRequest, @Body() body: any) {
    return this.handleRequest(
      this.authServiceClient,
      { cmd: 'change_password' },
      { token: req.token, ...body },
      'Failed to change password',
    );
  }

  @Post('logout')
  async logout(@Req() req: AuthenticatedRequest) {
    return this.handleRequest(
      this.authServiceClient,
      { cmd: 'logout_user' },
      { token: req.token },
      'Logout failed',
    );
  }

  // ==================== DOCTOR-SPECIFIC AUTH ENDPOINTS ====================

  @Post('doctor/complete-profile')
  async completeDoctorProfile(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      consultation_fee?: number;
      available_days?: string[];
      start_time?: string;
      end_time?: string;
    },
  ) {
    return this.handleRequest(
      this.doctorServiceClient,
      { cmd: 'update_doctor_profile' },
      { token: req.token, updates: body },
      'Failed to complete doctor profile',
    );
  }

  @Get('doctor/profile')
  async getDoctorProfile(@Req() req: AuthenticatedRequest) {
    try {
      const doctor = await this.handleRequest(
        this.doctorServiceClient,
        { cmd: 'get_doctor_by_user_id' },
        { token: req.token, userId: req.user.id },
        'Doctor profile not found',
      );
      return { success: true, data: { exists: true, doctor: doctor.data } };
    } catch (error) {
      if (error.status === 404) {
        return { success: true, data: { exists: false } };
      }
      throw error;
    }
  }
}
