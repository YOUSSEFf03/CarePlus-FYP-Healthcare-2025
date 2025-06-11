// src/app.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { TemplateService } from './services/template.service';
import { NotificationType } from './entities/notification-log.entity';

// Import DTOs
import { SendNotificationDto } from './dto/send-notification.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { SendTemplateNotificationDto } from './dto/send-template-notification.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly templateService: TemplateService,
  ) {}

  // ==================== CORE NOTIFICATION ENDPOINTS ====================

  @MessagePattern({ cmd: 'send_notification' })
  async sendNotification(@Payload() data: SendNotificationDto) {
    return this.appService.sendNotification(data);
  }

  @MessagePattern({ cmd: 'send_otp' })
  async sendOtp(@Payload() data: SendOtpDto) {
    return this.appService.sendOtp(data);
  }

  @MessagePattern({ cmd: 'send_template_notification' })
  async sendTemplateNotification(@Payload() data: SendTemplateNotificationDto) {
    return this.appService.sendTemplateNotification(data);
  }

  // ==================== SPECIFIC NOTIFICATION TYPES ====================

  @MessagePattern({ cmd: 'send_email_otp' })
  async sendEmailOtp(
    @Payload()
    data: {
      userId: string;
      email: string;
      otp: string;
      userName?: string;
    },
  ) {
    return this.appService.sendOtp({
      userId: data.userId,
      type: NotificationType.EMAIL,
      recipient: data.email,
      otp: data.otp,
      userName: data.userName,
    });
  }

  @MessagePattern({ cmd: 'send_whatsapp_otp' })
  async sendWhatsappOtp(
    @Payload()
    data: {
      userId: string;
      phone: string;
      otp: string;
      userName?: string;
    },
  ) {
    return this.appService.sendOtp({
      userId: data.userId,
      type: NotificationType.WHATSAPP,
      recipient: data.phone,
      otp: data.otp,
      userName: data.userName,
    });
  }

  @MessagePattern({ cmd: 'send_password_reset_email' })
  async sendPasswordResetEmail(
    @Payload()
    data: {
      userId: string;
      email: string;
      otp: string;
      userName?: string;
    },
  ) {
    return this.appService.sendTemplateNotification({
      userId: data.userId,
      templateName: 'password_reset',
      type: NotificationType.EMAIL,
      recipient: data.email,
      templateData: {
        otp: data.otp,
        userName: data.userName || 'User',
      },
    });
  }

  @MessagePattern({ cmd: 'send_appointment_reminder' })
  async sendAppointmentReminder(
    @Payload()
    data: {
      userId: string;
      type: 'email' | 'whatsapp';
      recipient: string;
      appointmentDate: string;
      appointmentTime: string;
      doctorName: string;
      patientName: string;
    },
  ) {
    return this.appService.sendTemplateNotification({
      userId: data.userId,
      templateName: 'appointment_reminder',
      type: data.type as NotificationType,
      recipient: data.recipient,
      templateData: {
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        doctorName: data.doctorName,
        patientName: data.patientName,
      },
    });
  }

  @MessagePattern({ cmd: 'send_doctor_verification_email' })
  async sendDoctorVerificationEmail(
    @Payload()
    data: {
      userId: string;
      email: string;
      doctorName: string;
      status: 'approved' | 'rejected';
      rejectionReason?: string;
    },
  ) {
    return this.appService.sendTemplateNotification({
      userId: data.userId,
      templateName: `doctor_verification_${data.status}`,
      type: NotificationType.EMAIL,
      recipient: data.email,
      templateData: {
        doctorName: data.doctorName,
        rejectionReason: data.rejectionReason,
      },
    });
  }

  // ==================== USER PREFERENCES ====================

  @MessagePattern({ cmd: 'get_user_preferences' })
  async getUserPreferences(@Payload() data: { userId: string }) {
    return this.appService.getUserPreferences(data.userId);
  }

  @MessagePattern({ cmd: 'update_user_preferences' })
  async updateUserPreferences(@Payload() data: UpdateUserPreferencesDto) {
    return this.appService.updateUserPreferences(data);
  }

  // ==================== NOTIFICATION HISTORY ====================

  @MessagePattern({ cmd: 'get_notification_history' })
  async getNotificationHistory(
    @Payload() data: { userId: string; limit?: number },
  ) {
    return this.appService.getNotificationHistory(data.userId, data.limit);
  }

  @MessagePattern({ cmd: 'get_notification_status' })
  async getNotificationStatus(@Payload() data: { logId: string }) {
    return this.appService.getNotificationStatus(data.logId);
  }

  // ==================== TEMPLATE MANAGEMENT ====================

  @MessagePattern({ cmd: 'create_template' })
  async createTemplate(@Payload() data: CreateTemplateDto) {
    return this.templateService.createTemplate(data);
  }

  @MessagePattern({ cmd: 'get_all_templates' })
  async getAllTemplates() {
    return this.templateService.getAllTemplates();
  }

  @MessagePattern({ cmd: 'get_template' })
  async getTemplate(@Payload() data: { name: string; type: string }) {
    return this.templateService.getTemplate(data.name, data.type as any);
  }

  @MessagePattern({ cmd: 'update_template' })
  async updateTemplate(@Payload() data: { id: string; updates: any }) {
    return this.templateService.updateTemplate(data.id, data.updates);
  }

  // ==================== FALLBACK ====================

  @MessagePattern()
  handleUnknown(@Payload() data: any) {
    return this.appService.handleUnknown(data);
  }
}
