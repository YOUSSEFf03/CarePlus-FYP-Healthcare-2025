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
import { Delete } from '@nestjs/common';

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
    @Req() req?: AuthenticatedRequest,
  ) {
    // This is a public route, but we might have auth middleware applied
    // We don't need authentication for this endpoint
    return this.handleRequest(
      { cmd: 'get_all_doctors' },
      { specialization, verification_status, is_active, page, limit },
      'Failed to get doctors',
    );
  }

  // Test endpoint to check if auth middleware is running
  @Get('test-middleware')
  async testMiddleware(@Req() req: AuthenticatedRequest) {
    console.log('Test middleware route reached - req.user:', req.user);
    console.log('Test middleware route reached - req.token:', req.token);
    console.log(
      'Test middleware route reached - req.headers.authorization:',
      req.headers.authorization,
    );
    return {
      success: true,
      message: 'Middleware test endpoint reached',
      user: req.user,
      hasToken: !!req.token,
      hasAuthHeader: !!req.headers.authorization,
      authHeader: req.headers.authorization ? 'Present' : 'Missing',
    };
  }

  @Get('workplaces')
  async getDoctorWorkplaces(@Req() req: AuthenticatedRequest) {
    // Debug: Log the request to see what's happening
    console.log('getDoctorWorkplaces - req.user:', req.user);
    console.log('getDoctorWorkplaces - req.token:', req.token);

    // Check if user is authenticated (auth middleware should have set this)
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required. Please provide a valid token.',
          error: 'Unauthorized',
        },
        401,
      );
    }

    // Check if user has doctor role
    if (req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'get_doctor_workplaces' },
      { token: req.token },
      'Failed to get doctor workplaces',
    );
  }

  @Get('stats')
  async getGeneralStats() {
    return this.handleRequest(
      { cmd: 'get_system_appointment_statistics' },
      {},
      'Failed to get system statistics',
    );
  }

  @Get(':id')
  async getDoctorById(@Param('id') id: string) {
    // Basic validation - check if id looks like a UUID
    if (!id || typeof id !== 'string' || id.length < 10) {
      throw new HttpException(
        {
          success: false,
          status: 400,
          message: 'Invalid doctor ID format.',
          error: 'Bad Request',
        },
        400,
      );
    }

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
    // Basic validation - check if doctorId looks like a UUID
    if (!doctorId || typeof doctorId !== 'string' || doctorId.length < 10) {
      throw new HttpException(
        {
          success: false,
          status: 400,
          message: 'Invalid doctor ID format.',
          error: 'Bad Request',
        },
        400,
      );
    }

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

  @Get('appointments')
  async getAppointments(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: string,
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // Check if user is authenticated and has doctor role
    if (!req.user || req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'get_appointments_by_doctor' },
      { token: req.token, status, date_from, date_to, page, limit },
      'Failed to get doctor appointments',
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
  @Post('invite-assistant')
  async inviteAssistant(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      assistantEmail: string;
      workplaceId: string;
      message?: string;
    },
  ) {
    // Check if user is doctor
    if (req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'invite_assistant' },
      {
        token: req.token,
        doctorUserId: req.user.id,
        assistantEmail: body.assistantEmail,
        workplaceId: body.workplaceId,
        message: body.message,
      },
      'Failed to invite assistant',
    );
  }

  @Get('my-assistants')
  async getMyAssistants(@Req() req: AuthenticatedRequest) {
    // Check if user is doctor
    if (req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'get_my_assistants' },
      { token: req.token, doctorUserId: req.user.id },
      'Failed to get assistants',
    );
  }

  @Get('pending-invites')
  async getPendingInvites(@Req() req: AuthenticatedRequest) {
    // Check if user is doctor
    if (req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'get_doctor_pending_invites' },
      { token: req.token, doctorUserId: req.user.id },
      'Failed to get pending invites',
    );
  }

  @Delete('remove-assistant')
  async removeAssistant(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      assistantId: string;
      workplaceId: string;
      reason?: string;
    },
  ) {
    // Check if user is doctor
    if (req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'remove_assistant' },
      {
        token: req.token,
        doctorUserId: req.user.id,
        assistantId: body.assistantId,
        workplaceId: body.workplaceId,
        reason: body.reason,
      },
      'Failed to remove assistant',
    );
  }

  @Delete('cancel-invite/:inviteId')
  async cancelInvite(
    @Req() req: AuthenticatedRequest,
    @Param('inviteId') inviteId: string,
  ) {
    // Check if user is doctor
    if (req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'cancel_invite' },
      {
        token: req.token,
        doctorUserId: req.user.id,
        inviteId: inviteId,
      },
      'Failed to cancel invite',
    );
  }
  @Get('analytics/weekly')
  async getWeeklyAnalytics(@Req() req: AuthenticatedRequest) {
    if (req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'get_weekly_analytics' },
      { token: req.token, userId: req.user.id }, // Send userId instead of getting doctorId
      'Failed to get weekly analytics',
    );
  }

  @Get('analytics/monthly')
  async getMonthlyAnalytics(@Req() req: AuthenticatedRequest) {
    if (req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'get_monthly_analytics' },
      { token: req.token, userId: req.user.id }, // Send userId instead of getting doctorId
      'Failed to get monthly analytics',
    );
  }

  @Get('schedule/today')
  async getTodaysSchedule(@Req() req: AuthenticatedRequest) {
    if (req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'get_todays_schedule' },
      { token: req.token, userId: req.user.id }, // Send userId instead of getting doctorId
      "Failed to get today's schedule",
    );
  }

  // ==================== APPOINTMENT STATISTICS ====================

  @Get('appointments/statistics')
  async getAppointmentStatistics(@Req() req: AuthenticatedRequest) {
    if (req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'get_appointment_statistics' },
      { token: req.token, userId: req.user.id },
      'Failed to get appointment statistics',
    );
  }

  @Get('appointments/statistics/date-range')
  async getAppointmentStatisticsByDateRange(
    @Req() req: AuthenticatedRequest,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    if (req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    if (!startDate || !endDate) {
      throw new HttpException(
        {
          success: false,
          status: 400,
          message: 'start_date and end_date query parameters are required',
          error: 'Bad Request',
        },
        400,
      );
    }

    return this.handleRequest(
      { cmd: 'get_appointment_statistics_by_date_range' },
      {
        token: req.token,
        userId: req.user.id,
        startDate,
        endDate,
      },
      'Failed to get appointment statistics by date range',
    );
  }

  // Admin-only route for system-wide statistics
  @Get('appointments/statistics/system')
  async getSystemAppointmentStatistics(@Req() req: AuthenticatedRequest) {
    if (req.user.role !== 'admin') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Admin access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'get_system_appointment_statistics' },
      { token: req.token },
      'Failed to get system appointment statistics',
    );
  }

  // ==================== WORKPLACE MANAGEMENT ====================

  @Post('workplaces')
  async createWorkplace(
    @Req() req: AuthenticatedRequest,
    @Body()
    workplaceData: {
      workplace_name: string;
      workplace_type: string;
      phone_number?: string;
      email?: string;
      description?: string;
      website?: string;
      working_hours?: any;
      consultation_fee?: number;
      services_offered?: string[];
      insurance_accepted?: string[];
      is_primary?: boolean;
      address: {
        building_name?: string;
        building_number?: string;
        floor_number?: string;
        street: string;
        city: string;
        state: string;
        country: string;
        zipcode?: string;
        area_description?: string;
        maps_link?: string;
      };
    },
  ) {
    if (req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'create_workplace' },
      { token: req.token, workplaceData },
      'Failed to create workplace',
    );
  }

  @Put('workplaces/:workplaceId')
  async updateWorkplace(
    @Req() req: AuthenticatedRequest,
    @Param('workplaceId') workplaceId: string,
    @Body() updates: any,
  ) {
    if (req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'update_workplace' },
      { token: req.token, workplaceId, updates },
      'Failed to update workplace',
    );
  }

  @Delete('workplaces/:workplaceId')
  async deleteWorkplace(
    @Req() req: AuthenticatedRequest,
    @Param('workplaceId') workplaceId: string,
  ) {
    if (req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'delete_workplace' },
      { token: req.token, workplaceId },
      'Failed to delete workplace',
    );
  }

  @Post('workplaces/:workplaceId/appointment-slots')
  async createAppointmentSlots(
    @Req() req: AuthenticatedRequest,
    @Param('workplaceId') workplaceId: string,
    @Body()
    slotsData: {
      date: string;
      start_time: string;
      end_time: string;
      slot_duration: number;
    },
  ) {
    if (req.user.role !== 'doctor') {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'Doctor access required',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'create_appointment_slots' },
      { token: req.token, workplaceId, slotsData },
      'Failed to create appointment slots',
    );
  }

  @Get('workplaces/:workplaceId/appointment-slots')
  async getWorkplaceAppointmentSlots(
    @Param('workplaceId') workplaceId: string,
    @Query('date') date: string,
  ) {
    return this.handleRequest(
      { cmd: 'get_workplace_appointment_slots' },
      { workplaceId, date },
      'Failed to get workplace appointment slots',
    );
  }
}
