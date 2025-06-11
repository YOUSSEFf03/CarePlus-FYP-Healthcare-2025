import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { NotificationType } from '../entities/notification-log.entity';

export class SendOtpDto {
  @IsString()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  recipient: string;

  @IsString()
  otp: string;

  @IsOptional()
  @IsString()
  userName?: string;
}
