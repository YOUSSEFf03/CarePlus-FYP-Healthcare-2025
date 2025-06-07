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
