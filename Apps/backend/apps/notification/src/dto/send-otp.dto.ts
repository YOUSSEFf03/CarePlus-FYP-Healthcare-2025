export class SendOtpDto {
  @IsString()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  recipient: string; // email or phone

  @IsString()
  otp: string;

  @IsOptional()
  @IsString()
  userName?: string;
}
