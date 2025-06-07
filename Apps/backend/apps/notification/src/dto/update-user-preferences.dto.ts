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
