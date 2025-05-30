import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsNotEmpty()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, {
    message:
      'New password must be at least 8 characters long and contain letters and numbers',
  })
  newPassword: string;
}
