// doctor.controller.ts
import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './DTOs/create-doctor.Dto';
import { UpdateDoctorDto } from './DTOs/update-doctor.dto';
import { CreateAppointmentDto } from './DTOs/create-appointment.Dto';
import { UpdateAppointmentDto } from './DTOs/update-appointment.dto';
import { CreateReviewDto } from './DTOs/create-review.Dto';
import { GetAppointmentsDto } from './DTOs/get-appointments.dto';
import { GetDoctorsDto } from './DTOs/get-doctors.dto';
import { VerificationStatus } from './doctor.entity';
import { AppointmentStatus } from './appointment.entity';

// Import auth guards and decorators
import { MicroserviceAuthGuard } from './guards/microservice-auth.guard';
import { RoleGuard } from './guards/role.guard';
import { DoctorOwnershipGuard } from './guards/doctor-ownership.guard';
import {
  CurrentUser,
  RequireRoles,
  AdminOnly,
  DoctorOnly,
  AdminOrDoctor,
} from './decorators/auth.decorators';
import { UserRole } from './guards/role.guard';

@Controller()
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  // ==================== PUBLIC ROUTES ====================

  // This route is called by auth service when user registers as doctor
  @MessagePattern('create_doctor')
  async createDoctor(@Payload() data: CreateDoctorDto) {
    console.log(
      '📨 Doctor controller: Received create_doctor message with data:',
      data,
    );
    try {
      const result = await this.doctorService.createDoctor(data);
      console.log('✅ Doctor controller: Successfully created doctor:', result);
      return result;
    } catch (error) {
      console.error('❌ Doctor controller: Error creating doctor:', error);
      throw error;
    }
  }

  // Public route to get all verified doctors (for patient booking)
  @MessagePattern({ cmd: 'get_all_doctors' })
  async getAllDoctors(@Payload() data: GetDoctorsDto) {
    return this.doctorService.getAllDoctors(data);
  }

  // Public route to get doctor available slots
  @MessagePattern({ cmd: 'get_doctor_available_slots' })
  async getDoctorAvailableSlots(
    @Payload() data: { doctorId: string; date: string },
  ) {
    return this.doctorService.getDoctorAvailableSlots(data.doctorId, data.date);
  }

  // Public route to get doctor reviews
  @MessagePattern({ cmd: 'get_doctor_reviews' })
  async getDoctorReviews(@Payload() data: { doctorId: string }) {
    return this.doctorService.getDoctorReviews(data.doctorId);
  }

  // Public route to get doctor by ID (for viewing profile)
  @MessagePattern({ cmd: 'get_doctor_by_id' })
  async getDoctorById(@Payload() data: { id: string }) {
    return this.doctorService.getDoctorById(data.id);
  }

  // ==================== AUTHENTICATED ROUTES ====================

  @UseGuards(MicroserviceAuthGuard)
  @MessagePattern({ cmd: 'get_doctor_by_user_id' })
  async getDoctorByUserId(@Payload() data: any, @CurrentUser() user: any) {
    // Users can only get their own doctor profile, or admins can get any
    const targetUserId = data.userId || user.id;

    if (user.role !== UserRole.ADMIN && targetUserId !== user.id) {
      throw new Error('Unauthorized to access this doctor profile');
    }

    return this.doctorService.getDoctorByUserId(targetUserId);
  }

  // ==================== DOCTOR-ONLY ROUTES ====================

  @UseGuards(MicroserviceAuthGuard, RoleGuard, DoctorOwnershipGuard)
  @DoctorOnly()
  @MessagePattern({ cmd: 'update_doctor_profile' })
  async updateDoctorProfile(@Payload() data: any, @CurrentUser() user: any) {
    // Get doctor profile by user ID
    const doctor = await this.doctorService.getDoctorByUserId(user.id);
    return this.doctorService.updateDoctorProfile(user.id, data.updates);
  }

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @DoctorOnly()
  @MessagePattern({ cmd: 'get_appointments_by_doctor' })
  async getAppointmentsByDoctor(
    @Payload() data: any,
    @CurrentUser() user: any,
  ) {
    // Get doctor's own appointments
    const doctor = await this.doctorService.getDoctorByUserId(user.id);
    return this.doctorService.getAppointmentsByDoctor(doctor.id, data);
  }

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @DoctorOnly()
  @MessagePattern({ cmd: 'get_doctor_stats' })
  async getDoctorStats(@Payload() data: any, @CurrentUser() user: any) {
    // Get doctor's own stats
    const doctor = await this.doctorService.getDoctorByUserId(user.id);
    return this.doctorService.getDoctorStats(doctor.id);
  }

  // ==================== PATIENT ROUTES ====================

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.PATIENT)
  @MessagePattern({ cmd: 'create_appointment' })
  async createAppointment(@Payload() data: any, @CurrentUser() user: any) {
    // Ensure patient can only book for themselves
    const appointmentData = { ...data, patientId: user.id };
    return this.doctorService.createAppointment(appointmentData);
  }

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.PATIENT)
  @MessagePattern({ cmd: 'get_appointments_by_patient' })
  async getAppointmentsByPatient(
    @Payload() data: any,
    @CurrentUser() user: any,
  ) {
    // Patient can only see their own appointments
    return this.doctorService.getAppointmentsByPatient(user.id);
  }

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.PATIENT)
  @MessagePattern({ cmd: 'create_review' })
  async createReview(@Payload() data: any, @CurrentUser() user: any) {
    // Ensure patient can only review their own appointments
    const reviewData = { ...data, patientId: user.id };
    return this.doctorService.createReview(reviewData);
  }

  // ==================== ADMIN-ONLY ROUTES ====================

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @AdminOnly()
  @MessagePattern({ cmd: 'verify_doctor' })
  async verifyDoctor(
    @Payload()
    data: {
      doctorId: string;
      status: VerificationStatus;
      rejection_reason?: string;
    },
  ) {
    return this.doctorService.verifyDoctor(
      data.doctorId,
      data.status,
      data.rejection_reason,
    );
  }

  // ==================== DOCTOR OR ADMIN ROUTES ====================

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @AdminOrDoctor()
  @MessagePattern({ cmd: 'update_appointment_status' })
  async updateAppointmentStatus(
    @Payload()
    data: {
      appointmentId: string;
      status: AppointmentStatus;
      updates?: Partial<UpdateAppointmentDto>;
    },
    @CurrentUser() user: any,
  ) {
    // If user is doctor, verify they own the appointment
    if (user.role === UserRole.DOCTOR) {
      const doctor = await this.doctorService.getDoctorByUserId(user.id);
      // Add verification that appointment belongs to this doctor
      // This would need additional logic in the service
    }

    return this.doctorService.updateAppointmentStatus(
      data.appointmentId,
      data.status,
      data.updates,
    );
  }
  // ==================== ASSISTANT MANAGEMENT ====================

  // Cancel Invite (Doctor only)
  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.DOCTOR)
  @MessagePattern({ cmd: 'cancel_invite' })
  async cancelInvite(
    @Payload()
    data: {
      doctorUserId: string;
      inviteId: string;
    },
  ) {
    return this.doctorService.cancelInvite(data.doctorUserId, data.inviteId);
  }

  // 7. Assistant Responds to Invite
  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.ASSISTANT)
  @MessagePattern({ cmd: 'respond_to_invite' })
  async respondToInvite(
    @Payload()
    data: {
      token: string;
      inviteId: string;
      response: 'accept' | 'reject';
    },
    @CurrentUser() user: any,
  ) {
    return this.doctorService.respondToAssistantInvite(
      user.id,
      data.inviteId,
      data.response,
    );
  }

  // ==================== ERROR HANDLER ====================

  @MessagePattern()
  handleUnknown(@Payload() data: any) {
    console.warn('Received unknown message pattern:', data);
    return { error: 'Unknown command' };
  }

  // ==================== ASSISTANT MANAGEMENT ====================

  // Doctor removes an assistant from workplace
  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.DOCTOR)
  @MessagePattern({ cmd: 'remove_assistant' })
  async removeAssistant(
    @Payload()
    data: {
      assistantId: string;
      workplaceId: string;
      reason?: string;
    },
    @CurrentUser() user: any,
  ) {
    // Doctor removes assistant (new service method you should add if needed)
    return this.doctorService.removeAssistantFromWorkplace(
      user.id,
      data.assistantId,
      data.workplaceId,
      data.reason,
    );
  }

  // Doctor invites assistant
  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.DOCTOR)
  @MessagePattern({ cmd: 'invite_assistant' })
  async inviteAssistant(
    @Payload()
    data: { assistantEmail: string; workplaceId: string; message?: string },
    @CurrentUser() user: any,
  ) {
    return this.doctorService.inviteAssistant(
      user.id,
      data.assistantEmail,
      data.workplaceId,
      data.message,
    );
  }

  // Assistant gets their invites
  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.ASSISTANT)
  @MessagePattern({ cmd: 'get_my_invites' })
  async getMyInvites(@CurrentUser() user: any) {
    return this.doctorService.getAssistantInvites(user.id);
  }

  // Doctor gets all assistants across workplaces
  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.DOCTOR)
  @MessagePattern({ cmd: 'get_my_assistants' })
  async getMyAssistants(@CurrentUser() user: any) {
    return this.doctorService.getDoctorAssistants(user.id);
  }

  // ==================== DOCTOR PENDING INVITES ====================

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.DOCTOR)
  @MessagePattern({ cmd: 'get_doctor_pending_invites' })
  async getDoctorPendingInvites(@CurrentUser() user: any) {
    return this.doctorService.getDoctorPendingInvites(user.id);
  }

  // ==================== ANALYTICS MESSAGE PATTERNS ====================

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @DoctorOnly()
  @MessagePattern({ cmd: 'get_weekly_analytics' })
  async getWeeklyAnalytics(
    @Payload() data: { userId: string },
    @CurrentUser() user: any,
  ) {
    const doctor = await this.doctorService.getDoctorByUserId(
      data.userId || user.id,
    );
    return this.doctorService.getDoctorWeeklyStats(doctor.id);
  }

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @DoctorOnly()
  @MessagePattern({ cmd: 'get_monthly_analytics' })
  async getMonthlyAnalytics(
    @Payload() data: { userId: string },
    @CurrentUser() user: any,
  ) {
    const doctor = await this.doctorService.getDoctorByUserId(
      data.userId || user.id,
    );
    return this.doctorService.getDoctorMonthlyStats(doctor.id);
  }

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @DoctorOnly()
  @MessagePattern({ cmd: 'get_todays_schedule' })
  async getTodaysSchedule(
    @Payload() data: { userId: string },
    @CurrentUser() user: any,
  ) {
    const doctor = await this.doctorService.getDoctorByUserId(
      data.userId || user.id,
    );
    return this.doctorService.getTodaysSchedule(doctor.id);
  }

  // ==================== APPOINTMENT STATISTICS ====================

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @DoctorOnly()
  @MessagePattern({ cmd: 'get_appointment_statistics' })
  async getAppointmentStatistics(
    @Payload() data: { userId: string },
    @CurrentUser() user: any,
  ) {
    const doctor = await this.doctorService.getDoctorByUserId(
      data.userId || user.id,
    );
    return this.doctorService.getAppointmentStatistics(doctor.id);
  }

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @DoctorOnly()
  @MessagePattern({ cmd: 'get_appointment_statistics_by_date_range' })
  async getAppointmentStatisticsByDateRange(
    @Payload()
    data: {
      userId: string;
      startDate: string;
      endDate: string;
    },
    @CurrentUser() user: any,
  ) {
    const doctor = await this.doctorService.getDoctorByUserId(
      data.userId || user.id,
    );
    return this.doctorService.getAppointmentStatisticsByDateRange(
      doctor.id,
      data.startDate,
      data.endDate,
    );
  }

  // Admin-only route for system-wide statistics
  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @AdminOnly()
  @MessagePattern({ cmd: 'get_system_appointment_statistics' })
  async getSystemAppointmentStatistics() {
    return this.doctorService.getAppointmentStatistics();
  }

  // ==================== WORKPLACE MANAGEMENT ====================

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.DOCTOR)
  @MessagePattern({ cmd: 'create_workplace' })
  async createWorkplace(@Payload() data: any, @CurrentUser() user: any) {
    return this.doctorService.createWorkplace(user.id, data.workplaceData);
  }

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.DOCTOR)
  @MessagePattern({ cmd: 'get_doctor_workplaces' })
  async getDoctorWorkplaces(@CurrentUser() user: any) {
    return this.doctorService.getDoctorWorkplaces(user.id);
  }

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.DOCTOR)
  @MessagePattern({ cmd: 'update_workplace' })
  async updateWorkplace(@Payload() data: any, @CurrentUser() user: any) {
    return this.doctorService.updateWorkplace(
      user.id,
      data.workplaceId,
      data.updates,
    );
  }

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.DOCTOR)
  @MessagePattern({ cmd: 'delete_workplace' })
  async deleteWorkplace(@Payload() data: any, @CurrentUser() user: any) {
    return this.doctorService.deleteWorkplace(user.id, data.workplaceId);
  }

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.DOCTOR)
  @MessagePattern({ cmd: 'create_appointment_slots' })
  async createAppointmentSlots(@Payload() data: any, @CurrentUser() user: any) {
    return this.doctorService.createAppointmentSlots(
      user.id,
      data.workplaceId,
      data.slotsData,
    );
  }

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.DOCTOR)
  @MessagePattern({ cmd: 'get_workplace_appointment_slots' })
  async getWorkplaceAppointmentSlots(@Payload() data: any) {
    return this.doctorService.getWorkplaceAppointmentSlots(
      data.workplaceId,
      data.date,
    );
  }

  // ==================== ADDITIONAL ASSISTANT ROUTES ====================

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.ASSISTANT)
  @MessagePattern({ cmd: 'get_assistant_workplaces' })
  async getAssistantWorkplaces(@CurrentUser() user: any) {
    return this.doctorService.getAssistantWorkplaces(user.id);
  }

  @UseGuards(MicroserviceAuthGuard, RoleGuard)
  @RequireRoles(UserRole.ASSISTANT)
  @MessagePattern({ cmd: 'leave_workplace' })
  async leaveWorkplace(@Payload() data: any, @CurrentUser() user: any) {
    return this.doctorService.leaveWorkplace(
      user.id,
      data.workplaceId,
      data.reason,
    );
  }
}
