import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../user.entity';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain letters and numbers',
  })
  password: string;

  @IsNotEmpty()
  @IsEnum(UserRole, {
    message: 'Role must be one of: patient, doctor, pharmacy, assistant, admin',
  })
  role: UserRole;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  profile_picture_url?: string;

  // ==================== PATIENT-SPECIFIC FIELDS ====================
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date_of_birth must be YYYY-MM-DD',
  })
  date_of_birth?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  medical_history?: string;

  // ==================== DOCTOR-SPECIFIC FIELDS ====================
  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  license_number?: string;

  @IsOptional()
  @IsString()
  dr_idCard_url?: string;

  @IsOptional()
  @IsString()
  biography?: string;

  @IsOptional()
  @IsString()
  medical_license_url?: string;

  @IsOptional()
  @IsString()
  verification_status?: string;

  // ==================== PHARMACY-SPECIFIC FIELDS ====================
  @IsOptional()
  @IsString()
  pharmacy_owner?: string;

  @IsOptional()
  @IsString()
  pharmacy_name?: string;
}
