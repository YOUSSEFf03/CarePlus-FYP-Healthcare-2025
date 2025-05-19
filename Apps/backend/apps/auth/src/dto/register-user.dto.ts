import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

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
  @IsString()
  role: 'patient' | 'doctor' | 'admin';

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  profile_picture_url?: string;

  // patient-specific:
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
}
