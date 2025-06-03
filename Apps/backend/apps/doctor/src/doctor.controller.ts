// ==================== doctor.controller.ts ====================
import { Controller } from '@nestjs/common';
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

@Controller()
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  // ==================== DOCTOR MANAGEMENT ====================
  @MessagePattern('create_doctor')
  async createDoctor(@Payload() data: CreateDoctorDto) {
    return this.doctorService.createDoctor(data);
  }

  @MessagePattern({ cmd: 'get_doctor_by_user_id' })
  async getDoctorByUserId(@Payload() data: { userId: string }) {
    return this.doctorService.getDoctorByUserId(data.userId);
  }

  @MessagePattern({ cmd: 'get_doctor_by_id' })
  async getDoctorById(@Payload() data: { id: string }) {
    return this.doctorService.getDoctorById(data.id);
  }

  @MessagePattern({ cmd: 'update_doctor_profile' })
  async updateDoctorProfile(
    @Payload() data: { userId: string; updates: UpdateDoctorDto },
  ) {
    return this.doctorService.updateDoctorProfile(data.userId, data.updates);
  }

  @MessagePattern({ cmd: 'get_all_doctors' })
  async getAllDoctors(@Payload() data: GetDoctorsDto) {
    return this.doctorService.getAllDoctors(data);
  }

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

  @MessagePattern({ cmd: 'get_doctor_available_slots' })
  async getDoctorAvailableSlots(
    @Payload() data: { doctorId: string; date: string },
  ) {
    return this.doctorService.getDoctorAvailableSlots(data.doctorId, data.date);
  }

  // ==================== APPOINTMENT MANAGEMENT ====================
  @MessagePattern({ cmd: 'create_appointment' })
  async createAppointment(@Payload() data: CreateAppointmentDto) {
    return this.doctorService.createAppointment(data);
  }

  @MessagePattern({ cmd: 'get_appointments_by_doctor' })
  async getAppointmentsByDoctor(
    @Payload()
    data: {
      doctorId: string;
    } & GetAppointmentsDto,
  ) {
    return this.doctorService.getAppointmentsByDoctor(data.doctorId, data);
  }

  @MessagePattern({ cmd: 'get_appointments_by_patient' })
  async getAppointmentsByPatient(@Payload() data: { patientId: string }) {
    return this.doctorService.getAppointmentsByPatient(data.patientId);
  }

  @MessagePattern({ cmd: 'update_appointment_status' })
  async updateAppointmentStatus(
    @Payload()
    data: {
      appointmentId: string;
      status: AppointmentStatus;
      updates?: Partial<UpdateAppointmentDto>;
    },
  ) {
    return this.doctorService.updateAppointmentStatus(
      data.appointmentId,
      data.status,
      data.updates,
    );
  }

  // ==================== REVIEW MANAGEMENT ====================
  @MessagePattern({ cmd: 'create_review' })
  async createReview(@Payload() data: CreateReviewDto) {
    return this.doctorService.createReview(data);
  }

  @MessagePattern({ cmd: 'get_doctor_reviews' })
  async getDoctorReviews(@Payload() data: { doctorId: string }) {
    return this.doctorService.getDoctorReviews(data.doctorId);
  }

  // ==================== ANALYTICS ====================
  @MessagePattern({ cmd: 'get_doctor_stats' })
  async getDoctorStats(@Payload() data: { doctorId: string }) {
    return this.doctorService.getDoctorStats(data.doctorId);
  }

  @MessagePattern()
  handleUnknown(@Payload() data: any) {
    console.warn('Received unknown message pattern:', data);
    return { error: 'Unknown command' };
  }
}
