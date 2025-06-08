// src/notification.controller.ts - SECURED VERSION
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Req,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AuthenticatedRequest } from './middleware/auth.middleware';

enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  PHARMACY = 'pharmacy',
  ADMIN = 'admin',
  ASSISTANT = 'assistant',
}

@Controller('api/notifications')
export class NotificationController {
  constructor(
    @Inject('NOTIFICATION_SERVICE_CLIENT')
    private readonly notificationClient: ClientProxy,
    @Inject('AUTH_SERVICE_CLIENT')
    private readonly authClient: ClientProxy,
    @Inject('DOCTOR_SERVICE_CLIENT')
    private readonly doctorClient: ClientProxy,
  ) {}

  async handleRequest(pattern: any, body: any, fallbackMsg: string) {
    try {
      const result = await lastValueFrom(
        this.notificationClient.send(pattern, body),
      );
      return {
        success: true,
        data: result,
        message: 'Operation successful',
      };
    } catch (err) {
      console.error('Notification Microservice Error:', err);

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

  // ==================== SECURITY VALIDATION METHODS ====================

  private requireAdmin(user: any): void {
    if (user.role !== UserRole.ADMIN) {
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
  }

  private requireRole(user: any, allowedRoles: UserRole[]): void {
    if (!allowedRoles.includes(user.role)) {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: `Access restricted to: ${allowedRoles.join(', ')}`,
          error: 'Forbidden',
        },
        403,
      );
    }
  }

  private async validateNotificationOwnership(
    logId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const notification = await lastValueFrom(
        this.notificationClient.send(
          { cmd: 'get_notification_status' },
          { logId },
        ),
      );

      return notification.userId === userId;
    } catch (error) {
      return false;
    }
  }

  private async validateDoctorPatientRelationship(
    doctorUserId: string,
    patientUserId: string,
  ): Promise<boolean> {
    try {
      // Get doctor profile
      const doctor = await lastValueFrom(
        this.doctorClient.send(
          { cmd: 'get_doctor_by_user_id' },
          { userId: doctorUserId },
        ),
      );

      if (!doctor) return false;

      // Check if doctor has appointments with this patient
      const appointments = await lastValueFrom(
        this.doctorClient.send(
          { cmd: 'get_appointments_by_doctor' },
          {
            doctorId: doctor.id,
            patientId: patientUserId,
          },
        ),
      );

      return (
        appointments &&
        appointments.appointments &&
        appointments.appointments.length > 0
      );
    } catch (error) {
      console.error('Error validating doctor-patient relationship:', error);
      return false;
    }
  }

  // ==================== USER NOTIFICATION PREFERENCES (SECURED) ====================

  @Get('preferences')
  async getUserPreferences(@Req() req: AuthenticatedRequest) {
    // ✅ SECURE: User can only access their own preferences
    return this.handleRequest(
      { cmd: 'get_user_preferences' },
      { userId: req.user.id },
      'Failed to get notification preferences',
    );
  }

  @Put('preferences')
  async updateUserPreferences(
    @Req() req: AuthenticatedRequest,
    @Body() preferences: any,
  ) {
    // ✅ SECURE: User can only update their own preferences
    return this.handleRequest(
      { cmd: 'update_user_preferences' },
      { userId: req.user.id, ...preferences },
      'Failed to update notification preferences',
    );
  }

  // ==================== NOTIFICATION HISTORY (SECURED) ====================

  @Get('history')
  async getNotificationHistory(
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: number,
  ) {
    // ✅ SECURE: User can only see their own notification history
    return this.handleRequest(
      { cmd: 'get_notification_history' },
      { userId: req.user.id, limit: limit || 50 },
      'Failed to get notification history',
    );
  }

  @Get('status/:logId')
  async getNotificationStatus(
    @Req() req: AuthenticatedRequest,
    @Param('logId') logId: string,
  ) {
    // 🔒 SECURE: Validate ownership before showing status
    const isOwner = await this.validateNotificationOwnership(
      logId,
      req.user.id,
    );
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: 'You can only check the status of your own notifications',
          error: 'Forbidden',
        },
        403,
      );
    }

    return this.handleRequest(
      { cmd: 'get_notification_status' },
      { logId },
      'Failed to get notification status',
    );
  }

  // ==================== ADMIN NOTIFICATION HISTORY ====================

  @Get('admin/history/:userId')
  async getAdminNotificationHistory(
    @Req() req: AuthenticatedRequest,
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    // 🔒 ADMIN ONLY: View any user's notification history
    this.requireAdmin(req.user);

    return this.handleRequest(
      { cmd: 'get_notification_history' },
      { userId, limit: limit || 50 },
      'Failed to get notification history',
    );
  }

  // ==================== MANUAL NOTIFICATIONS (ROLE-BASED) ====================

  @Post('send')
  async sendNotification(
    @Req() req: AuthenticatedRequest,
    @Body()
    notificationData: {
      type: 'email' | 'whatsapp';
      recipient: string;
      subject: string;
      content: string;
      targetUserId?: string; // Optional: specify target user for validation
    },
  ) {
    // 🔒 ROLE-BASED RESTRICTIONS
    await this.validateNotificationPermissions(req.user, notificationData);

    return this.handleRequest(
      { cmd: 'send_notification' },
      {
        userId: req.user.id,
        ...notificationData,
      },
      'Failed to send notification',
    );
  }

  @Post('send-template')
  async sendTemplateNotification(
    @Req() req: AuthenticatedRequest,
    @Body()
    templateData: {
      templateName: string;
      type: 'email' | 'whatsapp';
      recipient: string;
      templateData: any;
      targetUserId?: string; // Optional: specify target user for validation
    },
  ) {
    // 🔒 ROLE-BASED RESTRICTIONS
    await this.validateTemplateNotificationPermissions(req.user, templateData);

    return this.handleRequest(
      { cmd: 'send_template_notification' },
      {
        userId: req.user.id,
        ...templateData,
      },
      'Failed to send template notification',
    );
  }

  // ==================== DOCTOR-SPECIFIC NOTIFICATIONS ====================

  @Post('send-appointment-reminder')
  async sendAppointmentReminder(
    @Req() req: AuthenticatedRequest,
    @Body()
    reminderData: {
      appointmentId: string;
      type: 'email' | 'whatsapp';
    },
  ) {
    // 🔒 DOCTORS ONLY: Send reminders for their own appointments
    this.requireRole(req.user, [UserRole.DOCTOR, UserRole.ADMIN]);

    // Validate doctor owns this appointment
    if (req.user.role === UserRole.DOCTOR) {
      const isValidAppointment = await this.validateDoctorAppointmentOwnership(
        req.user.id,
        reminderData.appointmentId,
      );

      if (!isValidAppointment) {
        throw new HttpException(
          {
            success: false,
            status: 403,
            message: 'You can only send reminders for your own appointments',
            error: 'Forbidden',
          },
          403,
        );
      }
    }

    // Get appointment details and send reminder
    return this.handleRequest(
      { cmd: 'send_appointment_reminder_by_id' },
      {
        appointmentId: reminderData.appointmentId,
        type: reminderData.type,
        senderUserId: req.user.id,
      },
      'Failed to send appointment reminder',
    );
  }

  // ==================== NOTIFICATION VALIDATION METHODS ====================

  private async validateNotificationPermissions(
    user: any,
    notificationData: any,
  ): Promise<void> {
    switch (user.role) {
      case UserRole.ADMIN:
        // ✅ Admins can send notifications to anyone
        return;

      case UserRole.DOCTOR:
        // 🔒 Doctors can only send to their patients
        if (notificationData.targetUserId) {
          const hasRelationship = await this.validateDoctorPatientRelationship(
            user.id,
            notificationData.targetUserId,
          );

          if (!hasRelationship) {
            throw new HttpException(
              {
                success: false,
                status: 403,
                message:
                  'Doctors can only send notifications to their patients',
                error: 'Forbidden',
              },
              403,
            );
          }
        } else {
          throw new HttpException(
            {
              success: false,
              status: 400,
              message: 'targetUserId is required for doctor notifications',
              error: 'Bad Request',
            },
            400,
          );
        }
        break;

      case UserRole.PHARMACY:
        // 🔒 Pharmacies can only send prescription-related notifications
        // Add pharmacy-specific validation here
        throw new HttpException(
          {
            success: false,
            status: 403,
            message: 'Pharmacy notification permissions not yet implemented',
            error: 'Forbidden',
          },
          403,
        );

      case UserRole.PATIENT:
        // 🔒 Patients cannot send manual notifications
        throw new HttpException(
          {
            success: false,
            status: 403,
            message: 'Patients cannot send manual notifications',
            error: 'Forbidden',
          },
          403,
        );

      default:
        throw new HttpException(
          {
            success: false,
            status: 403,
            message: 'Invalid user role',
            error: 'Forbidden',
          },
          403,
        );
    }
  }

  private async validateTemplateNotificationPermissions(
    user: any,
    templateData: any,
  ): Promise<void> {
    // 🔒 Template-specific restrictions
    const restrictedTemplates = [
      'otp',
      'password_reset',
      'doctor_verification_approved',
      'doctor_verification_rejected',
    ];

    if (
      restrictedTemplates.includes(templateData.templateName) &&
      user.role !== UserRole.ADMIN
    ) {
      throw new HttpException(
        {
          success: false,
          status: 403,
          message: `Template '${templateData.templateName}' is restricted to system use only`,
          error: 'Forbidden',
        },
        403,
      );
    }

    // Apply same role-based validation as manual notifications
    await this.validateNotificationPermissions(user, templateData);
  }

  private async validateDoctorAppointmentOwnership(
    doctorUserId: string,
    appointmentId: string,
  ): Promise<boolean> {
    try {
      // Get doctor profile
      const doctor = await lastValueFrom(
        this.doctorClient.send(
          { cmd: 'get_doctor_by_user_id' },
          { userId: doctorUserId },
        ),
      );

      if (!doctor) return false;

      // Check if appointment belongs to this doctor
      const appointments = await lastValueFrom(
        this.doctorClient.send(
          { cmd: 'get_appointments_by_doctor' },
          {
            doctorId: doctor.id,
          },
        ),
      );

      return appointments.appointments.some((apt) => apt.id === appointmentId);
    } catch (error) {
      console.error('Error validating doctor appointment ownership:', error);
      return false;
    }
  }

  // ==================== ADMIN TEMPLATE MANAGEMENT (SECURED) ====================

  @Get('templates')
  async getAllTemplates(@Req() req: AuthenticatedRequest) {
    // 🔒 ADMIN ONLY
    this.requireAdmin(req.user);

    return this.handleRequest(
      { cmd: 'get_all_templates' },
      {},
      'Failed to get templates',
    );
  }

  @Post('templates')
  async createTemplate(
    @Req() req: AuthenticatedRequest,
    @Body()
    templateData: {
      name: string;
      type: 'email' | 'whatsapp';
      subject: string;
      content: string;
      defaultData?: any;
    },
  ) {
    // 🔒 ADMIN ONLY
    this.requireAdmin(req.user);

    return this.handleRequest(
      { cmd: 'create_template' },
      templateData,
      'Failed to create template',
    );
  }

  @Put('templates/:id')
  async updateTemplate(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updates: any,
  ) {
    // 🔒 ADMIN ONLY
    this.requireAdmin(req.user);

    return this.handleRequest(
      { cmd: 'update_template' },
      { id, updates },
      'Failed to update template',
    );
  }

  @Get('templates/:name/:type')
  async getTemplate(
    @Req() req: AuthenticatedRequest,
    @Param('name') name: string,
    @Param('type') type: string,
  ) {
    // 🔒 ADMIN ONLY: View specific template
    this.requireAdmin(req.user);

    return this.handleRequest(
      { cmd: 'get_template' },
      { name, type },
      'Failed to get template',
    );
  }

  // ==================== SYSTEM NOTIFICATIONS (ADMIN ONLY) ====================

  @Post('broadcast')
  async broadcastNotification(
    @Req() req: AuthenticatedRequest,
    @Body()
    broadcastData: {
      type: 'email' | 'whatsapp';
      subject: string;
      content: string;
      targetRole?: UserRole; // Optional: target specific role
      templateName?: string;
      templateData?: any;
    },
  ) {
    // 🔒 ADMIN ONLY: Broadcast to all users or specific role
    this.requireAdmin(req.user);

    return this.handleRequest(
      { cmd: 'broadcast_notification' },
      {
        senderUserId: req.user.id,
        ...broadcastData,
      },
      'Failed to send broadcast notification',
    );
  }
}
