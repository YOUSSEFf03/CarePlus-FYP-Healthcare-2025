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
