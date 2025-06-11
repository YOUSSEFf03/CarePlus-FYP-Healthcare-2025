import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';

// Import services
import { EmailService } from './services/email.service';
import { WhatsappService } from './services/whatsapp.service';
import { TemplateService } from './services/template.service';

// Import entities
import {
  NotificationLog,
  NotificationType,
  NotificationStatus,
} from './entities/notification-log.entity';
import { UserPreference } from './entities/user-preference.entity';

// Import DTOs
import { SendNotificationDto } from './dto/send-notification.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { SendTemplateNotificationDto } from './dto/send-template-notification.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(NotificationLog)
    private readonly notificationLogRepo: Repository<NotificationLog>,
    @InjectRepository(UserPreference)
    private readonly userPreferenceRepo: Repository<UserPreference>,
    private readonly emailService: EmailService,
    private readonly whatsappService: WhatsappService,
    private readonly templateService: TemplateService,
  ) {}

  private rpcError(message: string, status = 400) {
    return new RpcException({ status, message });
  }

  // ==================== CORE NOTIFICATION METHODS ====================

  async sendNotification(
    data: SendNotificationDto,
  ): Promise<{ success: boolean; logId: string }> {
    try {
      // Check user preferences
      const userPrefs = await this.getUserPreferences(data.userId);
      if (!this.isNotificationAllowed(data.type, userPrefs)) {
        throw this.rpcError(
          `${data.type} notifications disabled for user`,
          403,
        );
      }

      // Create notification log
      const notificationLog = this.notificationLogRepo.create({
        userId: data.userId,
        type: data.type,
        recipient: data.recipient,
        subject: data.subject,
        content: data.content,
        templateId: data.templateId,
        templateData: data.templateData,
        status: NotificationStatus.PENDING,
      });

      const savedLog = await this.notificationLogRepo.save(notificationLog);

      // Send notification based on type
      let result: { success: boolean; messageId?: string; error?: string };

      switch (data.type) {
        case NotificationType.EMAIL:
          result = await this.emailService.sendEmail(
            data.recipient,
            data.subject,
            data.content,
          );
          break;

        case NotificationType.WHATSAPP:
          result = await this.whatsappService.sendMessage(
            data.recipient,
            data.content,
          );
          break;

        default:
          throw this.rpcError(`Notification type ${data.type} not supported`);
      }

      // Update notification log
      await this.updateNotificationLog(savedLog.id, result);

      return {
        success: result.success,
        logId: savedLog.id,
      };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  async sendOtp(
    data: SendOtpDto,
  ): Promise<{ success: boolean; logId: string }> {
    try {
      // Use template if available, otherwise use default
      const template = await this.templateService.getTemplate('otp', data.type);

      let subject: string;
      let content: string;

      if (template) {
        const rendered = await this.templateService.renderTemplate(template, {
          otp: data.otp,
          userName: data.userName || 'User',
        });
        subject = rendered.subject;
        content = rendered.content;
      } else {
        // Default OTP message
        subject = 'Verify your account';
        content =
          data.type === NotificationType.EMAIL
            ? `<p>Hello ${data.userName || 'User'},</p><p>Your verification code is: <strong>${data.otp}</strong></p>`
            : `Your OTP is: ${data.otp}`;
      }

      return this.sendNotification({
        userId: data.userId,
        type: data.type,
        recipient: data.recipient,
        subject,
        content,
        templateId: template?.id,
        templateData: { otp: data.otp, userName: data.userName },
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }

  async sendTemplateNotification(
    data: SendTemplateNotificationDto,
  ): Promise<{ success: boolean; logId: string }> {
    try {
      const template = await this.templateService.getTemplate(
        data.templateName,
        data.type,
      );

      if (!template) {
        throw this.rpcError(
          `Template ${data.templateName} not found for type ${data.type}`,
          404,
        );
      }

      const rendered = await this.templateService.renderTemplate(
        template,
        data.templateData,
      );

      return this.sendNotification({
        userId: data.userId,
        type: data.type,
        recipient: data.recipient,
        subject: rendered.subject,
        content: rendered.content,
        templateId: template.id,
        templateData: data.templateData,
      });
    } catch (error) {
      console.error('Error sending template notification:', error);
      throw error;
    }
  }

  // ==================== USER PREFERENCES ====================

  async getUserPreferences(userId: string): Promise<UserPreference> {
    let preferences = await this.userPreferenceRepo.findOne({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences
      preferences = this.userPreferenceRepo.create({
        userId,
        emailEnabled: true,
        whatsappEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
      });
      preferences = await this.userPreferenceRepo.save(preferences);
    }

    return preferences;
  }

  async updateUserPreferences(
    data: UpdateUserPreferencesDto,
  ): Promise<UserPreference> {
    try {
      let preferences = await this.userPreferenceRepo.findOne({
        where: { userId: data.userId },
      });

      if (!preferences) {
        preferences = this.userPreferenceRepo.create({ userId: data.userId });
      }

      // Update preferences
      Object.assign(preferences, data);

      return this.userPreferenceRepo.save(preferences);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw this.rpcError('Failed to update user preferences');
    }
  }

  // ==================== NOTIFICATION HISTORY ====================

  async getNotificationHistory(
    userId: string,
    limit: number = 50,
  ): Promise<NotificationLog[]> {
    return this.notificationLogRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getNotificationStatus(logId: string): Promise<NotificationLog> {
    const log = await this.notificationLogRepo.findOne({
      where: { id: logId },
    });

    if (!log) {
      throw this.rpcError('Notification log not found', 404);
    }

    return log;
  }

  // ==================== HELPER METHODS ====================

  private isNotificationAllowed(
    type: NotificationType,
    preferences: UserPreference,
  ): boolean {
    switch (type) {
      case NotificationType.EMAIL:
        return preferences.emailEnabled;
      case NotificationType.WHATSAPP:
        return preferences.whatsappEnabled;
      case NotificationType.SMS:
        return preferences.smsEnabled;
      case NotificationType.PUSH:
        return preferences.pushEnabled;
      default:
        return true;
    }
  }

  private async updateNotificationLog(
    logId: string,
    result: { success: boolean; messageId?: string; error?: string },
  ): Promise<void> {
    const updateData: Partial<NotificationLog> = {
      status: result.success
        ? NotificationStatus.SENT
        : NotificationStatus.FAILED,
      externalId: result.messageId,
      errorMessage: result.error,
      sentAt: result.success ? new Date() : null,
    };

    await this.notificationLogRepo.update(logId, updateData);
  }

  handleUnknown(data: any) {
    console.warn('Received unknown message pattern:', data);
    return { error: 'Unknown command', data };
  }
}
