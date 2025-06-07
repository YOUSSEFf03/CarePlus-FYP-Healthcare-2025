import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { NotificationType } from '../entities/notification-log.entity';

export class SendNotificationDto {
  @IsString()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  recipient: string; // email or phone

  @IsString()
  subject: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsObject()
  templateData?: any;
}
