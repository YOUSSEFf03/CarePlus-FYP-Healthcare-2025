import { Injectable } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh_token.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AppService {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'register_user' })
  async registerUser(
    @Payload() data: RegisterUserDto,
  ): Promise<AuthResponseDto> {
    const user = await this.usersService.createUser(data);

    if (!user) {
      throw new Error('User registration failed');
    }
    const tokens = await this.usersService.generateTokens(user);
    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expires_in: '15m',
      token_type: 'Bearer',
    };
  }

  @MessagePattern({ cmd: 'login_user' })
  async loginUser(@Payload() data: LoginUserDto): Promise<AuthResponseDto> {
    const userWithTokens = await this.usersService.login(
      data.email,
      data.password,
    );

    return {
      access_token: userWithTokens.access_token,
      refresh_token: userWithTokens.refresh_token,
      expires_in: '15m',
      token_type: 'Bearer',
    };
  }

  @MessagePattern({ cmd: 'refresh_token' })
  async refreshToken(
    @Payload() data: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    const tokens = await this.usersService.refreshUserToken(data.refresh_token);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: '15m',
      token_type: 'Bearer',
    };
  }
  @MessagePattern({ cmd: 'logout_user' })
  async logoutUser(@Payload() data: { userId: string }) {
    await this.usersService.logout(data.userId);
    return { message: 'Logged out successfully' };
  }

  @MessagePattern({ cmd: 'verify_otp' })
  async verifyOtp(@Payload() data: VerifyOtpDto): Promise<{ message: string }> {
    const message = await this.usersService.verifyOtp(data.email, data.otp);
    return { message };
  }
}
