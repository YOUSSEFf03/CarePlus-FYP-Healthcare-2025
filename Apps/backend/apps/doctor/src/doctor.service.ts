// src/doctor.service.ts - FIXED VERSION
import { Injectable, Inject, Delete } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
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
import { AssistantInvite, InviteStatus } from './assistant-invite.entity';
import { DoctorWorkplace, WorkplaceType } from './doctor-workplace.entity';
import { Address } from './address.entity';
import { AppointmentSlot } from './appointment-slot.entity';
import { DoctorWorkplaceAssistant } from './doctor-workplace-assistant.entity';
// Define interfaces for type safety
interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(DoctorReview)
    private readonly reviewRepo: Repository<DoctorReview>,
    @InjectRepository(DoctorWorkplaceAssistant)
    private readonly doctorWorkplaceAssistantRepo: Repository<DoctorWorkplaceAssistant>,
    @InjectRepository(DoctorWorkplace)
    private readonly workplaceRepo: Repository<DoctorWorkplace>,
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
    @InjectRepository(AppointmentSlot)
    private readonly appointmentSlotRepo: Repository<AppointmentSlot>,
    @InjectRepository(AssistantInvite)
    private readonly assistantInviteRepo: Repository<AssistantInvite>,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
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
      throw this.rpcError('Doctor not found', 404);
    }
    return doctor;
  }

  async getDoctorById(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepo.findOne({ where: { id } });
    if (!doctor) {
      throw this.rpcError('Doctor not found', 404);
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

    const updatedDoctor = await this.doctorRepo.save(doctor);

    // Send notification about verification status change
    await this.sendDoctorVerificationNotification(
      doctor,
      status,
      rejection_reason,
    );

    return updatedDoctor;
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

    const savedAppointment = await this.appointmentRepo.save(appointment);

    // Send appointment confirmation notification (optional)
    try {
      console.log(
        'Appointment created successfully, confirmation could be sent',
      );
      // You can add appointment confirmation logic here if needed
    } catch (error) {
      console.error('Failed to send appointment confirmation:', error);
    }

    return savedAppointment;
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

  // ==================== NOTIFICATION METHODS ====================

  private async sendDoctorVerificationNotification(
    doctor: Doctor,
    status: VerificationStatus,
    rejectionReason?: string,
  ): Promise<void> {
    try {
      // Get user info from auth service first
      const userInfo = (await firstValueFrom(
        this.authClient.send(
          { cmd: 'get_user_by_id' },
          { userId: doctor.userId },
        ),
      )) as UserInfo; // ← FIXED: Type assertion

      if (!userInfo) {
        console.error('User not found for doctor verification notification');
        return;
      }

      // Send verification notification
      const result = await firstValueFrom(
        this.notificationClient.send(
          { cmd: 'send_doctor_verification_email' },
          {
            userId: doctor.userId,
            email: userInfo.email, // ← FIXED: Now properly typed
            doctorName: userInfo.name, // ← FIXED: Now properly typed
            status: status.toLowerCase(), // 'approved' or 'rejected'
            rejectionReason: rejectionReason,
          },
        ),
      );

      console.log('Doctor verification notification sent:', result);
    } catch (error) {
      console.error('Failed to send doctor verification notification:', error);
      // Don't throw error - verification should still complete
    }
  }

  private async sendAppointmentReminderNotification(
    appointment: Appointment,
  ): Promise<void> {
    try {
      // Get doctor and patient info
      const doctor = await this.getDoctorById(appointment.doctorId);

      // Get patient info from auth service
      const patientInfo = (await firstValueFrom(
        this.authClient.send(
          { cmd: 'get_user_by_id' },
          { userId: appointment.patientId },
        ),
      )) as UserInfo; // ← FIXED: Type assertion

      const doctorInfo = (await firstValueFrom(
        this.authClient.send(
          { cmd: 'get_user_by_id' },
          { userId: doctor.userId },
        ),
      )) as UserInfo; // ← FIXED: Type assertion

      if (!patientInfo || !doctorInfo) {
        console.error('User info not found for appointment reminder');
        return;
      }

      // Send email reminder
      const emailResult = await firstValueFrom(
        this.notificationClient.send(
          { cmd: 'send_appointment_reminder' },
          {
            userId: appointment.patientId,
            type: 'email',
            recipient: patientInfo.email, // ← FIXED: Now properly typed
            appointmentDate: appointment.appointment_date,
            appointmentTime: appointment.appointment_time,
            doctorName: doctorInfo.name, // ← FIXED: Now properly typed
            patientName: patientInfo.name, // ← FIXED: Now properly typed
          },
        ),
      );

      // Send WhatsApp reminder if patient has phone
      if (patientInfo.phone) {
        // ← FIXED: Now properly typed
        const whatsappResult = await firstValueFrom(
          this.notificationClient.send(
            { cmd: 'send_appointment_reminder' },
            {
              userId: appointment.patientId,
              type: 'whatsapp',
              recipient: patientInfo.phone, // ← FIXED: Now properly typed
              appointmentDate: appointment.appointment_date,
              appointmentTime: appointment.appointment_time,
              doctorName: doctorInfo.name, // ← FIXED: Now properly typed
              patientName: patientInfo.name, // ← FIXED: Now properly typed
            },
          ),
        );
      }

      console.log('Appointment reminder sent');
    } catch (error) {
      console.error('Failed to send appointment reminder:', error);
    }
  }

  // ==================== NEW METHOD FOR REMINDER SCHEDULING ====================

  async scheduleAppointmentReminders(): Promise<void> {
    try {
      // Get appointments for tomorrow (24-hour reminder)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      const appointmentsTomorrow = await this.appointmentRepo.find({
        where: {
          appointment_date: tomorrowString,
          status: AppointmentStatus.PENDING,
        },
      });

      console.log(
        `📅 Found ${appointmentsTomorrow.length} appointments for tomorrow`,
      );

      // Send reminders for each appointment
      for (const appointment of appointmentsTomorrow) {
        await this.sendAppointmentReminderNotification(appointment);
      }

      console.log('All appointment reminders processed');
    } catch (error) {
      console.error('Error scheduling appointment reminders:', error);
    }
  }

  // ==================== UPDATED ASSISTANT METHODS WITH WORKPLACE ====================

  // 10. Add to doctor.service.ts

  async inviteAssistant(
    doctorUserId: string,
    assistantEmail: string,
    workplaceId: string,
    message?: string,
  ): Promise<AssistantInvite> {
    try {
      const doctor = await this.getDoctorByUserId(doctorUserId);

      // Verify workplace belongs to doctor
      const workplace = await this.validateDoctorWorkplace(
        doctor.id,
        workplaceId,
      );
      if (!workplace) {
        throw this.rpcError('Workplace not found or access denied', 403);
      }

      // Get assistant user from auth service
      const assistantUser = (await firstValueFrom(
        this.authClient.send(
          { cmd: 'get_user_by_email' },
          { email: assistantEmail },
        ),
      )) as UserInfo;

      if (!assistantUser || assistantUser.role !== 'assistant') {
        throw this.rpcError('Assistant not found or invalid role', 404);
      }

      // Check if already invited to this workplace
      const existingInvite = await this.assistantInviteRepo.findOne({
        where: {
          doctorId: doctor.id,
          assistantId: assistantUser.id,
          workplaceId: workplaceId, // ← NOW INCLUDES WORKPLACE
          status: InviteStatus.PENDING,
        },
      });

      if (existingInvite) {
        throw this.rpcError('Assistant already invited to this workplace', 409);
      }

      // Create invite
      const invite = this.assistantInviteRepo.create({
        doctorId: doctor.id,
        assistantId: assistantUser.id,
        workplaceId: workplaceId, // ← NOW INCLUDES WORKPLACE
        status: InviteStatus.PENDING,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        message,
      });

      const savedInvite = await this.assistantInviteRepo.save(invite);

      // Send notification to assistant
      await this.sendAssistantInviteNotification(
        assistantUser,
        doctor,
        workplace,
        message,
      );

      return savedInvite;
    } catch (error) {
      console.error('Error inviting assistant:', error);
      throw error;
    }
  }

  async respondToAssistantInvite(
    assistantUserId: string,
    inviteId: string,
    response: 'accept' | 'reject',
  ): Promise<{ message: string }> {
    try {
      // Get invite
      const invite = await this.assistantInviteRepo.findOne({
        where: { id: inviteId, assistantId: assistantUserId },
      });

      if (!invite) {
        throw this.rpcError('Invite not found', 404);
      }

      if (invite.status !== InviteStatus.PENDING) {
        throw this.rpcError('Invite already responded to', 400);
      }

      if (invite.expires_at < new Date()) {
        invite.status = InviteStatus.EXPIRED;
        await this.assistantInviteRepo.save(invite);
        throw this.rpcError('Invite has expired', 400);
      }

      // Update invite status
      invite.status =
        response === 'accept' ? InviteStatus.ACCEPTED : InviteStatus.REJECTED;
      await this.assistantInviteRepo.save(invite);

      if (response === 'accept') {
        // Add assistant to workplace
        await this.addAssistantToWorkplace(invite);

        // Send acceptance notification to doctor
        await this.sendInviteResponseNotification(invite, 'accepted');

        return { message: 'Invite accepted successfully' };
      } else {
        // Send rejection notification to doctor
        await this.sendInviteResponseNotification(invite, 'rejected');

        return { message: 'Invite rejected' };
      }
    } catch (error) {
      console.error('Error responding to invite:', error);
      throw error;
    }
  }

  async getAssistantInvites(
    assistantUserId: string,
  ): Promise<AssistantInvite[]> {
    return this.assistantInviteRepo.find({
      where: { assistantId: assistantUserId },
      order: { created_at: 'DESC' },
    });
  }

  async getDoctorAssistants(doctorUserId: string): Promise<any[]> {
    const doctor = await this.getDoctorByUserId(doctorUserId);

    // Get all assistants for this doctor's workplaces
    const assistants = await this.doctorWorkplaceAssistantRepo
      .createQueryBuilder('dwa')
      .leftJoin('doctor_workplaces', 'dw', 'dw.id = dwa.doctorWorkplaceId')
      .where('dw.doctorId = :doctorId', { doctorId: doctor.id })
      .andWhere('dwa.status = :status', { status: 'active' })
      .getMany();

    // Get user details for each assistant
    const assistantDetails = [];
    for (const assistant of assistants) {
      const userInfo = (await firstValueFrom(
        this.authClient.send(
          { cmd: 'get_user_by_id' },
          { userId: assistant.assistantId },
        ),
      )) as UserInfo;

      assistantDetails.push({
        ...assistant,
        userInfo,
      });
    }

    return assistantDetails;
  }

  private async addAssistantToWorkplace(
    invite: AssistantInvite,
  ): Promise<void> {
    // Get workplace ID from invite (you'll need to store this in invite)
    const workplaceAssistant = this.doctorWorkplaceAssistantRepo.create({
      doctorWorkplaceId: invite.workplaceId, // You'll need to add this to invite entity
      assistantId: invite.assistantId,
      inviteId: invite.id,
      status: 'active',
    });

    await this.doctorWorkplaceAssistantRepo.save(workplaceAssistant);
  }

  // ==================== NOTIFICATION METHODS ====================

  private async sendAssistantInviteNotification(
    assistant: UserInfo,
    doctor: Doctor,
    workplace: any,
    message?: string,
  ): Promise<void> {
    try {
      const doctorUser = (await firstValueFrom(
        this.authClient.send(
          { cmd: 'get_user_by_id' },
          { userId: doctor.userId },
        ),
      )) as UserInfo;

      await firstValueFrom(
        this.notificationClient.send(
          { cmd: 'send_template_notification' },
          {
            userId: assistant.id,
            templateName: 'assistant_invite',
            type: 'email',
            recipient: assistant.email,
            templateData: {
              assistantName: assistant.name,
              doctorName: doctorUser.name,
              workplaceName: workplace.workplace_name,
              message: message || '',
              inviteLink: `${process.env.FRONTEND_URL}/assistant/invites`,
            },
          },
        ),
      );

      console.log('Assistant invite notification sent');
    } catch (error) {
      console.error('Failed to send assistant invite notification:', error);
    }
  }

  private async sendInviteResponseNotification(
    invite: AssistantInvite,
    response: 'accepted' | 'rejected',
  ): Promise<void> {
    try {
      // Get doctor and assistant info
      const [doctorUser, assistantUser] = await Promise.all([
        firstValueFrom(
          this.authClient.send(
            { cmd: 'get_user_by_doctor_id' },
            { doctorId: invite.doctorId },
          ),
        ) as Promise<UserInfo>,
        firstValueFrom(
          this.authClient.send(
            { cmd: 'get_user_by_id' },
            { userId: invite.assistantId },
          ),
        ) as Promise<UserInfo>,
      ]);

      await firstValueFrom(
        this.notificationClient.send(
          { cmd: 'send_template_notification' },
          {
            userId: doctorUser.id,
            templateName: `assistant_invite_${response}`,
            type: 'email',
            recipient: doctorUser.email,
            templateData: {
              doctorName: doctorUser.name,
              assistantName: assistantUser.name,
              response: response,
            },
          },
        ),
      );

      console.log(`Assistant invite ${response} notification sent to doctor`);
    } catch (error) {
      console.error(`Failed to send invite ${response} notification:`, error);
    }
  }

  // ==================== WORKPLACE MANAGEMENT ====================

  async createWorkplace(
    doctorUserId: string,
    workplaceData: {
      workplace_name: string;
      workplace_type: WorkplaceType;
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
  ): Promise<DoctorWorkplace> {
    try {
      const doctor = await this.getDoctorByUserId(doctorUserId);

      // If this is the first workplace or marked as primary, make it primary
      if (workplaceData.is_primary) {
        // Remove primary flag from other workplaces
        await this.workplaceRepo.update(
          { doctorId: doctor.id },
          { is_primary: false },
        );
      }

      // Create workplace
      const workplace = this.workplaceRepo.create({
        ...workplaceData,
        doctorId: doctor.id,
      });

      const savedWorkplace = await this.workplaceRepo.save(workplace);

      // Create address for workplace
      const address = this.addressRepo.create({
        ...workplaceData.address,
        doctor_workplace_id: savedWorkplace.id,
      });

      await this.addressRepo.save(address);

      return savedWorkplace;
    } catch (error) {
      console.error('Error creating workplace:', error);
      throw this.rpcError('Failed to create workplace');
    }
  }

  async getDoctorWorkplaces(doctorUserId: string): Promise<DoctorWorkplace[]> {
    try {
      const doctor = await this.getDoctorByUserId(doctorUserId);

      const workplaces = await this.workplaceRepo.find({
        where: { doctorId: doctor.id, is_active: true },
        order: { is_primary: 'DESC', created_at: 'ASC' },
      });

      // Get addresses for each workplace
      for (const workplace of workplaces) {
        workplace.addresses = await this.addressRepo.find({
          where: { doctor_workplace_id: workplace.id, is_active: true },
        });
      }

      return workplaces;
    } catch (error) {
      console.error('Error getting doctor workplaces:', error);
      throw error;
    }
  }

  async updateWorkplace(
    doctorUserId: string,
    workplaceId: string,
    updates: Partial<DoctorWorkplace>,
  ): Promise<DoctorWorkplace> {
    try {
      const doctor = await this.getDoctorByUserId(doctorUserId);

      // Verify workplace belongs to doctor
      const workplace = await this.workplaceRepo.findOne({
        where: { id: workplaceId, doctorId: doctor.id },
      });

      if (!workplace) {
        throw this.rpcError('Workplace not found or access denied', 404);
      }

      // If setting as primary, remove primary from others
      if (updates.is_primary) {
        await this.workplaceRepo.update(
          { doctorId: doctor.id },
          { is_primary: false },
        );
      }

      // Update workplace
      Object.assign(workplace, updates);
      return await this.workplaceRepo.save(workplace);
    } catch (error) {
      console.error('Error updating workplace:', error);
      throw error;
    }
  }

  async deleteWorkplace(
    doctorUserId: string,
    workplaceId: string,
  ): Promise<{ message: string }> {
    try {
      const doctor = await this.getDoctorByUserId(doctorUserId);

      // Verify workplace belongs to doctor
      const workplace = await this.workplaceRepo.findOne({
        where: { id: workplaceId, doctorId: doctor.id },
      });

      if (!workplace) {
        throw this.rpcError('Workplace not found or access denied', 404);
      }

      // Check if workplace has active assistants
      const activeAssistants = await this.doctorWorkplaceAssistantRepo.count({
        where: { doctorWorkplaceId: workplaceId, status: 'active' },
      });

      if (activeAssistants > 0) {
        throw this.rpcError(
          'Cannot delete workplace with active assistants. Remove assistants first.',
          400,
        );
      }

      // Soft delete (mark as inactive)
      await this.workplaceRepo.update(workplaceId, { is_active: false });
      await this.addressRepo.update(
        { doctor_workplace_id: workplaceId },
        { is_active: false },
      );

      return { message: 'Workplace deleted successfully' };
    } catch (error) {
      console.error('Error deleting workplace:', error);
      throw error;
    }
  }

  async validateDoctorWorkplace(
    doctorId: string,
    workplaceId: string,
  ): Promise<DoctorWorkplace | null> {
    return this.workplaceRepo.findOne({
      where: { id: workplaceId, doctorId, is_active: true },
    });
  }

  // ==================== APPOINTMENT SLOTS MANAGEMENT ====================

  async createAppointmentSlots(
    doctorUserId: string,
    workplaceId: string,
    slotsData: {
      date: string;
      start_time: string;
      end_time: string;
      slot_duration: number; // in minutes
    },
  ): Promise<AppointmentSlot[]> {
    try {
      const doctor = await this.getDoctorByUserId(doctorUserId);

      // Verify workplace belongs to doctor
      const workplace = await this.validateDoctorWorkplace(
        doctor.id,
        workplaceId,
      );
      if (!workplace) {
        throw this.rpcError('Workplace not found or access denied', 403);
      }

      // Generate time slots
      const slots = this.generateTimeSlots(
        slotsData.start_time,
        slotsData.end_time,
        slotsData.slot_duration,
      );

      const appointmentSlots: AppointmentSlot[] = [];

      for (const slot of slots) {
        // Check if slot already exists
        const existingSlot = await this.appointmentSlotRepo.findOne({
          where: {
            doctor_id: doctor.id,
            workplace_id: workplaceId,
            slot_date: slotsData.date,
            start_time: slot.start,
            end_time: slot.end,
          },
        });

        if (!existingSlot) {
          const appointmentSlot = this.appointmentSlotRepo.create({
            doctor_id: doctor.id,
            workplace_id: workplaceId,
            slot_date: slotsData.date,
            start_time: slot.start,
            end_time: slot.end,
            is_available: true,
          });

          appointmentSlots.push(appointmentSlot);
        }
      }

      if (appointmentSlots.length > 0) {
        return await this.appointmentSlotRepo.save(appointmentSlots);
      }

      return [];
    } catch (error) {
      console.error('Error creating appointment slots:', error);
      throw error;
    }
  }

  private generateTimeSlots(
    startTime: string,
    endTime: string,
    durationMinutes: number,
  ): { start: string; end: string }[] {
    const slots = [];
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);

    while (start < end) {
      const slotStart = start.toTimeString().slice(0, 5);
      start.setMinutes(start.getMinutes() + durationMinutes);

      if (start <= end) {
        const slotEnd = start.toTimeString().slice(0, 5);
        slots.push({ start: slotStart, end: slotEnd });
      }
    }

    return slots;
  }

  async getWorkplaceAppointmentSlots(
    workplaceId: string,
    date: string,
  ): Promise<AppointmentSlot[]> {
    return this.appointmentSlotRepo.find({
      where: {
        workplace_id: workplaceId,
        slot_date: date,
        is_available: true,
      },
      order: { start_time: 'ASC' },
    });
  }
}
