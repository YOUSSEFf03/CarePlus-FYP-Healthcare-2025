import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { NotificationType } from '../entities/notification-log.entity';
export class UpdateUserPreferencesDto {
  @IsString()
  userId: string;

  @IsOptional()
  emailEnabled?: boolean;

  @IsOptional()
  whatsappEnabled?: boolean;

  @IsOptional()
  smsEnabled?: boolean;

  @IsOptional()
  pushEnabled?: boolean;

  @IsOptional()
  @IsObject()
  notificationTypes?: any;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}
