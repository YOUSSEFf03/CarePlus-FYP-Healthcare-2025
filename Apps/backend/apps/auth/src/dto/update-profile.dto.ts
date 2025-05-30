import { IsOptional, IsString, IsUUID, IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  profile_picture_url?: string;
}
