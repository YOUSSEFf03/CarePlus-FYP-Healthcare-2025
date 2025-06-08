import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { NotificationType } from '../entities/notification-log.entity';

export class CreateTemplateDto {
  @IsString()
  name: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  subject: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsObject()
  defaultData?: any;
}
