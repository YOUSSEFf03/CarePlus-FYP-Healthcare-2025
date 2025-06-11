import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh_token.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { MicroserviceAuthGuard } from './guards/microservice-auth.guard';
import {
  CurrentMicroserviceUser,
  RequireRoles,
} from './decorators/auth.decorators';
import { UserRole } from './user.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService,
  ) {}

  // Public routes (no authentication required)
  @MessagePattern({ cmd: 'register_user' })
  async registerUser(
    @Payload() data: RegisterUserDto,
  ): Promise<AuthResponseDto> {
    return this.appService.registerUser(data);
  }

  @MessagePattern({ cmd: 'login_user' })
  async loginUser(@Payload() data: LoginUserDto): Promise<AuthResponseDto> {
    return this.appService.loginUser(data);
  }

  @MessagePattern({ cmd: 'refresh_token' })
  async refreshToken(
    @Payload() data: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    return this.appService.refreshToken(data);
  }

  @MessagePattern({ cmd: 'verify_otp' })
  async verifyOtp(@Payload() data: VerifyOtpDto): Promise<{ message: string }> {
    return this.appService.verifyOtp(data);
  }

  @MessagePattern({ cmd: 'resend_otp' })
  async resendOtp(
    @Payload() data: { email: string },
  ): Promise<{ message: string }> {
    return this.appService.resendOtp(data);
  }

  @MessagePattern({ cmd: 'forgot_password' })
  async forgotPassword(
    @Payload() data: { email: string },
  ): Promise<{ message: string }> {
    return this.appService.forgotPassword(data);
  }

  @MessagePattern({ cmd: 'reset_password' })
  async resetPassword(
    @Payload() data: { email: string; otp: string; newPassword: string },
  ): Promise<{ message: string }> {
    return this.appService.resetPassword(data);
  }

  // Protected routes (authentication required)
  @UseGuards(MicroserviceAuthGuard)
  @MessagePattern({ cmd: 'logout_user' })
  async logoutUser(@Payload() data: any, @CurrentMicroserviceUser() user: any) {
    return this.appService.logoutUser({ userId: user.id });
  }

  @UseGuards(MicroserviceAuthGuard)
  @MessagePattern({ cmd: 'get_user_by_id' })
  async getUserById(
    @Payload() data: any,
    @CurrentMicroserviceUser() user: any,
  ) {
    // Users can only get their own profile, or admins can get any profile
    const targetUserId = data.userId || user.id;

    if (user.role !== UserRole.ADMIN && targetUserId !== user.id) {
      throw new Error('Unauthorized to access this user profile');
    }

    const targetUser = await this.usersService.findById(targetUserId);
    if (!targetUser) return null;

    // Exclude sensitive fields
    const { password, refresh_token, otp_code, otp_expiry, ...safeUser } =
      targetUser;
    return safeUser;
  }

  @UseGuards(MicroserviceAuthGuard)
  @MessagePattern({ cmd: 'get_user_profile' })
  async getUserProfile(
    @Payload() data: any,
    @CurrentMicroserviceUser() user: any,
  ) {
    return this.appService.getUserProfile({ userId: user.id });
  }

  @UseGuards(MicroserviceAuthGuard)
  @MessagePattern({ cmd: 'update_user_profile' })
  async updateUserProfile(
    @Payload() data: any,
    @CurrentMicroserviceUser() user: any,
  ) {
    return this.appService.updateUserProfile({ ...data, userId: user.id });
  }

  @UseGuards(MicroserviceAuthGuard)
  @MessagePattern({ cmd: 'change_password' })
  async changePassword(
    @Payload() data: any,
    @CurrentMicroserviceUser() user: any,
  ) {
    return this.appService.changePassword({ ...data, userId: user.id });
  }

  // Admin-only routes
  @UseGuards(MicroserviceAuthGuard)
  @RequireRoles(UserRole.ADMIN)
  @MessagePattern({ cmd: 'get_all_users' })
  async getAllUsers(
    @Payload() data: any,
    @CurrentMicroserviceUser() user: any,
  ) {
    // Implementation for getting all users (admin only)
    return { message: 'Admin-only route - get all users' };
  }

  @MessagePattern({ cmd: 'verify_token' })
  async verifyToken(@Payload() data: { token: string }) {
    return this.appService.verifyToken(data);
  }

  @MessagePattern()
  handleUnknown(@Payload() data: any) {
    return this.appService.handleUnknown(data);
  }
}
