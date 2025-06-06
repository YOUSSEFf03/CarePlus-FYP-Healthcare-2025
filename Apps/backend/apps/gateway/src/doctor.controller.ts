import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  Inject,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AuthenticatedRequest } from './middleware/auth.middleware';

@Controller('doctors')
export class DoctorController {
  constructor(
    @Inject('DOCTOR_SERVICE_CLIENT')
    private readonly doctorServiceClient: ClientProxy,
  ) {}

  async handleRequest(pattern: any, body: any, fallbackMsg: string) {
    try {
      const result = await lastValueFrom(
        this.doctorServiceClient.send(pattern, body),
      );
      return {
        success: true,
        data: result,
        message: 'Operation successful',
      };
    } catch (err) {
      console.error('Doctor Microservice Error:', err);

      let status = err?.status || HttpStatus.BAD_REQUEST;
      if (typeof status !== 'number' || isNaN(status)) {
        status = HttpStatus.BAD_REQUEST;
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
      default:
        return 'Internal Server Error';
    }
  }

  // ==================== PUBLIC ROUTES ====================

  @Get()
  async getAllDoctors(
    @Query('specialization') specialization?: string,
    @Query('verification_status') verification_status?: string,
    @Query('is_active') is_active?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleRequest(
      { cmd: 'get_all_doctors' },
      { specialization, verification_status, is_active, page, limit },
      'Failed to get doctors',
    );
  }

  @Get(':id')
  async getDoctorById(@Param('id') id: string) {
    return this.handleRequest(
      { cmd: 'get_doctor_by_id' },
      { id },
      'Failed to get doctor',
    );
  }

  @Get(':doctorId/available-slots')
  async getDoctorAvailableSlots(
    @Param('doctorId') doctorId: string,
    @Query('date') date: string,
  ) {
    return this.handleRequest(
      { cmd: 'get_doctor_available_slots' },
      { doctorId, date },
      'Failed to get available slots',
    );
  }

  @Get(':doctorId/reviews')
  async getDoctorReviews(@Param('doctorId') doctorId: string) {
    return this.handleRequest(
      { cmd: 'get_doctor_reviews' },
      { doctorId },
      'Failed to get doctor reviews',
    );
  }

  @Get(':doctorId/stats')
  async getDoctorStats(@Param('doctorId') doctorId: string) {
    return this.handleRequest(
      { cmd: 'get_doctor_stats' },
      { doctorId },
      'Failed to get doctor stats',
    );
  }

  // ==================== PROTECTED ROUTES ====================
  // These routes require authentication middleware

  @Get('profile/me')
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    return this.handleRequest(
      { cmd: 'get_doctor_by_user_id' },
      { token: req.token, userId: req.user.id },
      'Failed to get doctor profile',
    );
  }

  @Put('profile/me')
  async updateMyProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updates: any,
  ) {
    return this.handleRequest(
      { cmd: 'update_doctor_profile' },
      { token: req.token, updates },
      'Failed to update doctor profile',
    );
  }

  @Get('appointments/me')
  async getMyAppointments(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: string,
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleRequest(
      { cmd: 'get_appointments_by_doctor' },
      { token: req.token, status, date_from, date_to, page, limit },
      'Failed to get doctor appointments',
    );
  }

  @Get('stats/me')
  async getMyStats(@Req() req: AuthenticatedRequest) {
    return this.handleRequest(
      { cmd: 'get_doctor_stats' },
      { token: req.token },
      'Failed to get doctor stats',
    );
  }

  // ==================== APPOINTMENT MANAGEMENT ====================

  @Post('appointments')
  async createAppointment(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      doctorId: string;
      appointment_date: string;
      appointment_time: string;
      symptoms?: string;
    },
  ) {
    return this.handleRequest(
      { cmd: 'create_appointment' },
      { token: req.token, ...body },
      'Failed to create appointment',
    );
  }

  @Get('appointments/my-bookings')
  async getMyBookings(@Req() req: AuthenticatedRequest) {
    return this.handleRequest(
      { cmd: 'get_appointments_by_patient' },
      { token: req.token },
      'Failed to get patient appointments',
    );
  }

  @Put('appointments/:appointmentId/status')
  async updateAppointmentStatus(
    @Req() req: AuthenticatedRequest,
    @Param('appointmentId') appointmentId: string,
    @Body()
    body: {
      status: string;
      diagnosis?: string;
      prescription?: string;
      notes?: string;
      cancellation_reason?: string;
    },
  ) {
    return this.handleRequest(
      { cmd: 'update_appointment_status' },
      { token: req.token, appointmentId, status: body.status, updates: body },
      'Failed to update appointment status',
    );
  }

  // ==================== REVIEW MANAGEMENT ====================

  @Post('reviews')
  async createReview(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      doctorId: string;
      appointmentId: string;
      rating: number;
      comment?: string;
    },
  ) {
    return this.handleRequest(
      { cmd: 'create_review' },
      { token: req.token, ...body },
      'Failed to create review',
    );
  }

  // ==================== ADMIN ROUTES ====================

  @Post('verify')
  async verifyDoctor(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      doctorId: string;
      status: string;
      rejection_reason?: string;
    },
  ) {
    return this.handleRequest(
      { cmd: 'verify_doctor' },
      { token: req.token, ...body },
      'Failed to verify doctor',
    );
  }

  // ==================== LEGACY ROUTES (for backward compatibility) ====================

  @Get('profile/:userId')
  async getDoctorByUserId(
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    // This route requires auth and user can only access their own profile or admin can access any
    return this.handleRequest(
      { cmd: 'get_doctor_by_user_id' },
      { token: req.token, userId },
      'Failed to get doctor profile',
    );
  }

  @Put('profile/:userId')
  async updateDoctorProfile(
    @Req() req: AuthenticatedRequest,
    @Param('userId') userId: string,
    @Body() updates: any,
  ) {
    return this.handleRequest(
      { cmd: 'update_doctor_profile' },
      { token: req.token, userId, updates },
      'Failed to update doctor profile',
    );
  }

  @Get(':doctorId/appointments')
  async getAppointmentsByDoctor(
    @Req() req: AuthenticatedRequest,
    @Param('doctorId') doctorId: string,
    @Query('status') status?: string,
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleRequest(
      { cmd: 'get_appointments_by_doctor' },
      { token: req.token, doctorId, status, date_from, date_to, page, limit },
      'Failed to get doctor appointments',
    );
  }
}
