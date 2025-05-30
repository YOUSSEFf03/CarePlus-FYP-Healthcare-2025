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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

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
      return result;
    } catch (err) {
      console.error('Doctor Microservice Error:', err);

      let status = err?.status || HttpStatus.BAD_REQUEST;
      if (typeof status !== 'number' || isNaN(status)) {
        status = HttpStatus.BAD_REQUEST;
      }
      const message = err?.response?.message || err?.message || fallbackMsg;
      throw new HttpException(message, status);
    }
  }

  // ==================== DOCTOR MANAGEMENT ====================
  @Get('profile/:userId')
  async getDoctorByUserId(@Param('userId') userId: string) {
    return this.handleRequest(
      { cmd: 'get_doctor_by_user_id' },
      { userId },
      'Failed to get doctor profile',
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

  @Put('profile/:userId')
  async updateDoctorProfile(
    @Param('userId') userId: string,
    @Body() updates: any,
  ) {
    return this.handleRequest(
      { cmd: 'update_doctor_profile' },
      { userId, updates },
      'Failed to update doctor profile',
    );
  }

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

  @Post('verify')
  async verifyDoctor(
    @Body()
    body: {
      doctorId: string;
      status: string;
      rejection_reason?: string;
    },
  ) {
    return this.handleRequest(
      { cmd: 'verify_doctor' },
      body,
      'Failed to verify doctor',
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

  @Get(':doctorId/stats')
  async getDoctorStats(@Param('doctorId') doctorId: string) {
    return this.handleRequest(
      { cmd: 'get_doctor_stats' },
      { doctorId },
      'Failed to get doctor stats',
    );
  }

  // ==================== APPOINTMENT MANAGEMENT ====================
  @Post('appointments')
  async createAppointment(
    @Body()
    body: {
      doctorId: string;
      patientId: string;
      appointment_date: string;
      appointment_time: string;
      symptoms?: string;
    },
  ) {
    return this.handleRequest(
      { cmd: 'create_appointment' },
      body,
      'Failed to create appointment',
    );
  }

  @Get(':doctorId/appointments')
  async getAppointmentsByDoctor(
    @Param('doctorId') doctorId: string,
    @Query('status') status?: string,
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleRequest(
      { cmd: 'get_appointments_by_doctor' },
      { doctorId, status, date_from, date_to, page, limit },
      'Failed to get doctor appointments',
    );
  }

  @Put('appointments/:appointmentId/status')
  async updateAppointmentStatus(
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
      { appointmentId, status: body.status, updates: body },
      'Failed to update appointment status',
    );
  }

  // ==================== REVIEW MANAGEMENT ====================
  @Post('reviews')
  async createReview(
    @Body()
    body: {
      doctorId: string;
      patientId: string;
      appointmentId: string;
      rating: number;
      comment?: string;
    },
  ) {
    return this.handleRequest(
      { cmd: 'create_review' },
      body,
      'Failed to create review',
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
}
