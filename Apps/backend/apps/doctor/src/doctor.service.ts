// ==================== doctor.service.ts ====================
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { Doctor, VerificationStatus } from './doctor.entity';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { DoctorReview } from './doctor-review.entity';
import { CreateDoctorDto } from './DTOs/create-doctor.Dto';
import { UpdateDoctorDto } from './DTOs/update-doctor.dto';
import { CreateAppointmentDto } from './DTOs/create-appointment.Dto';
import { UpdateAppointmentDto } from './DTOs/update-appointment.dto';
import { CreateReviewDto } from './DTOs/create-review.Dto';
import { GetAppointmentsDto } from './DTOs/get-appointments.dto';
import { GetDoctorsDto } from './DTOs/get-doctors.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(DoctorReview)
    private readonly reviewRepo: Repository<DoctorReview>,
  ) {}

  private rpcError(message: string, status = 400) {
    return new RpcException({ status, message });
  }

  // ==================== DOCTOR MANAGEMENT ====================
  async createDoctor(data: CreateDoctorDto): Promise<Doctor> {
    const existing = await this.doctorRepo.findOne({
      where: [{ userId: data.userId }, { license_number: data.license_number }],
    });

    if (existing) {
      throw this.rpcError(
        'Doctor already exists or license number already in use',
        409,
      );
    }

    const doctor = this.doctorRepo.create({
      ...data,
      verification_status:
        (data.verification_status as VerificationStatus) ||
        VerificationStatus.PENDING,
    });

    return await this.doctorRepo.save(doctor);
  }

  async getDoctorByUserId(userId: string): Promise<Doctor> {
    const doctor = await this.doctorRepo.findOne({ where: { userId } });
    if (!doctor) {
      throw this.rpcError(`Doctor not found ${userId}`, 404);
    }
    return doctor;
  }

  async getDoctorById(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepo.findOne({ where: { id } });
    if (!doctor) {
      throw this.rpcError(`Doctor not found with the ID ${id}`, 404);
    }
    return doctor;
  }

  async updateDoctorProfile(
    userId: string,
    updates: UpdateDoctorDto,
  ): Promise<Doctor> {
    const doctor = await this.getDoctorByUserId(userId);

    Object.assign(doctor, updates);
    return await this.doctorRepo.save(doctor);
  }

  async getAllDoctors(
    filters: GetDoctorsDto,
  ): Promise<{ doctors: Doctor[]; total: number }> {
    const {
      specialization,
      verification_status,
      is_active,
      page = 1,
      limit = 10,
    } = filters;

    const queryBuilder = this.doctorRepo.createQueryBuilder('doctor');

    if (specialization) {
      queryBuilder.andWhere('doctor.specialization ILIKE :specialization', {
        specialization: `%${specialization}%`,
      });
    }

    if (verification_status) {
      queryBuilder.andWhere(
        'doctor.verification_status = :verification_status',
        { verification_status },
      );
    }

    if (is_active !== undefined) {
      queryBuilder.andWhere('doctor.is_active = :is_active', { is_active });
    }

    const [doctors, total] = await queryBuilder
      .orderBy('doctor.rating', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { doctors, total };
  }

  async verifyDoctor(
    doctorId: string,
    status: VerificationStatus,
    rejection_reason?: string,
  ): Promise<Doctor> {
    const doctor = await this.getDoctorById(doctorId);

    doctor.verification_status = status;
    if (status === VerificationStatus.REJECTED && rejection_reason) {
      doctor.rejection_reason = rejection_reason;
    }

    return await this.doctorRepo.save(doctor);
  }

  // ==================== APPOINTMENT MANAGEMENT ====================
  async createAppointment(data: CreateAppointmentDto): Promise<Appointment> {
    // Check if doctor exists and is verified
    const doctor = await this.getDoctorById(data.doctorId);
    if (doctor.verification_status !== VerificationStatus.APPROVED) {
      throw this.rpcError('Doctor is not verified', 400);
    }

    // Check for conflicting appointments
    const existingAppointment = await this.appointmentRepo.findOne({
      where: {
        doctorId: data.doctorId,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        status: Not(AppointmentStatus.CANCELLED),
      },
    });

    if (existingAppointment) {
      throw this.rpcError('Time slot already booked', 409);
    }

    const appointment = this.appointmentRepo.create({
      ...data,
      consultation_fee: doctor.consultation_fee,
    });

    return await this.appointmentRepo.save(appointment);
  }

  async getAppointmentsByDoctor(
    doctorId: string,
    filters: GetAppointmentsDto,
  ): Promise<{ appointments: Appointment[]; total: number }> {
    const { status, date_from, date_to, page = 1, limit = 10 } = filters;

    const queryBuilder = this.appointmentRepo
      .createQueryBuilder('appointment')
      .where('appointment.doctorId = :doctorId', { doctorId });

    if (status) {
      queryBuilder.andWhere('appointment.status = :status', { status });
    }

    if (date_from && date_to) {
      queryBuilder.andWhere(
        'appointment.appointment_date BETWEEN :date_from AND :date_to',
        {
          date_from,
          date_to,
        },
      );
    }

    const [appointments, total] = await queryBuilder
      .orderBy('appointment.appointment_date', 'DESC')
      .addOrderBy('appointment.appointment_time', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { appointments, total };
  }

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    return await this.appointmentRepo.find({
      where: { patientId },
      order: { appointment_date: 'DESC', appointment_time: 'DESC' },
    });
  }

  async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus,
    updates?: Partial<UpdateAppointmentDto>,
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
    });
    if (!appointment) {
      throw this.rpcError('Appointment not found', 404);
    }

    appointment.status = status;
    if (updates) {
      Object.assign(appointment, updates);
    }

    // Update doctor statistics when appointment is completed
    if (status === AppointmentStatus.COMPLETED) {
      await this.doctorRepo.increment(
        { id: appointment.doctorId },
        'total_patients',
        1,
      );
    }

    return await this.appointmentRepo.save(appointment);
  }

  async getDoctorAvailableSlots(
    doctorId: string,
    date: string,
  ): Promise<string[]> {
    const doctor = await this.getDoctorById(doctorId);

    if (!doctor.available_days || !doctor.start_time || !doctor.end_time) {
      return [];
    }

    const dayOfWeek = new Date(date)
      .toLocaleDateString('en', { weekday: 'long' })
      .toLowerCase();

    if (!doctor.available_days.includes(dayOfWeek)) {
      return [];
    }

    // Get booked slots for the date
    const bookedAppointments = await this.appointmentRepo.find({
      where: {
        doctorId,
        appointment_date: date,
        status: Not(AppointmentStatus.CANCELLED),
      },
      select: ['appointment_time'],
    });

    const bookedTimes = bookedAppointments.map((apt) => apt.appointment_time);

    // Generate available slots (assuming 30-minute intervals)
    const availableSlots: string[] = [];
    const startHour = parseInt(doctor.start_time.split(':')[0]);
    const endHour = parseInt(doctor.end_time.split(':')[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      const slots = [
        `${hour.toString().padStart(2, '0')}:00`,
        `${hour.toString().padStart(2, '0')}:30`,
      ];

      slots.forEach((slot) => {
        if (!bookedTimes.includes(slot)) {
          availableSlots.push(slot);
        }
      });
    }

    return availableSlots;
  }

  // ==================== REVIEW MANAGEMENT ====================
  async createReview(data: CreateReviewDto): Promise<DoctorReview> {
    // Verify appointment exists and is completed
    const appointment = await this.appointmentRepo.findOne({
      where: {
        id: data.appointmentId,
        doctorId: data.doctorId,
        patientId: data.patientId,
        status: AppointmentStatus.COMPLETED,
      },
    });

    if (!appointment) {
      throw this.rpcError('Appointment not found or not completed', 404);
    }

    // Check if review already exists
    const existingReview = await this.reviewRepo.findOne({
      where: { appointmentId: data.appointmentId },
    });

    if (existingReview) {
      throw this.rpcError('Review already exists for this appointment', 409);
    }

    const review = this.reviewRepo.create(data);
    const savedReview = await this.reviewRepo.save(review);

    // Update doctor's rating
    await this.updateDoctorRating(data.doctorId);

    return savedReview;
  }

  async getDoctorReviews(doctorId: string): Promise<DoctorReview[]> {
    return await this.reviewRepo.find({
      where: { doctorId },
      order: { created_at: 'DESC' },
    });
  }

  private async updateDoctorRating(doctorId: string): Promise<void> {
    const reviews = await this.reviewRepo.find({ where: { doctorId } });

    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await this.doctorRepo.update(doctorId, {
      rating: Math.round(averageRating * 100) / 100,
      total_reviews: reviews.length,
    });
  }

  // ==================== ANALYTICS ====================
  async getDoctorStats(doctorId: string): Promise<{
    total_appointments: number;
    completed_appointments: number;
    cancelled_appointments: number;
    pending_appointments: number;
    total_patients: number;
    rating: number;
    total_reviews: number;
  }> {
    const doctor = await this.getDoctorById(doctorId);

    const appointments = await this.appointmentRepo.find({
      where: { doctorId },
    });

    const stats = {
      total_appointments: appointments.length,
      completed_appointments: appointments.filter(
        (apt) => apt.status === AppointmentStatus.COMPLETED,
      ).length,
      cancelled_appointments: appointments.filter(
        (apt) => apt.status === AppointmentStatus.CANCELLED,
      ).length,
      pending_appointments: appointments.filter(
        (apt) => apt.status === AppointmentStatus.PENDING,
      ).length,
      total_patients: doctor.total_patients,
      rating: doctor.rating,
      total_reviews: doctor.total_reviews,
    };

    return stats;
  }
}
