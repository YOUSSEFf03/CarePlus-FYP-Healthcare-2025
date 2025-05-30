import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh_token.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
//         name: 'DOCTOR_SERVICE',

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService,
  ) {}

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

  @MessagePattern({ cmd: 'logout_user' })
  async logoutUser(@Payload() data: { userId: string }) {
    return this.appService.logoutUser(data);
  }

  @MessagePattern({ cmd: 'verify_otp' })
  async verifyOtp(@Payload() data: VerifyOtpDto): Promise<{ message: string }> {
    return this.appService.verifyOtp(data);
  }

  @MessagePattern({ cmd: 'get_user_by_id' })
  async getUserById(@Payload() data: { userId: string }) {
    const user = await this.usersService.findById(data.userId);
    if (!user) return null;
    // You may want to exclude sensitive fields
    const { password, refresh_token, otp_code, otp_expiry, ...safeUser } = user;
    return safeUser;
  }

  @MessagePattern()
  handleUnknown(@Payload() data: any) {
    return this.appService.handleUnknown(data);
  }
}
