import { IsString, IsEnum, IsObject } from 'class-validator';
import { NotificationType } from '../entities/notification-log.entity';

export class SendTemplateNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  templateName: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  recipient: string;

  @IsObject()
  templateData: any;
}
