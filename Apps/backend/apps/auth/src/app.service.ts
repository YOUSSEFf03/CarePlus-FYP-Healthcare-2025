import { Injectable } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh_token.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { BadRequestException } from '@nestjs/common';
@Injectable()
export class AppService {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'register_user' })
  async registerUser(
    @Payload() data: RegisterUserDto,
  ): Promise<AuthResponseDto> {
    try {
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
    } catch (err) {
      console.error('Error in registerUser:', err?.message);
      throw new BadRequestException(err?.message || 'Registration failed');
    }
  }

  @MessagePattern({ cmd: 'login_user' })
  async loginUser(@Payload() data: LoginUserDto): Promise<AuthResponseDto> {
    try {
      console.log('login_user handler called with:', data);

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
    } catch (err) {
      console.error('Error in loginUser:', err?.message);
      throw new BadRequestException(err?.message || 'Login failed');
    }
  }

  @MessagePattern({ cmd: 'refresh_token' })
  async refreshToken(
    @Payload() data: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    try {
      const tokens = await this.usersService.refreshUserToken(
        data.refresh_token,
      );

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: '15m',
        token_type: 'Bearer',
      };
    } catch (err) {
      console.error('Error in refreshToken:', err?.message);
      throw new BadRequestException(err?.message || 'Token refresh failed');
    }
  }

  @MessagePattern({ cmd: 'logout_user' })
  async logoutUser(@Payload() data: { userId: string }) {
    try {
      await this.usersService.logout(data.userId);
      return { message: 'Logged out successfully' };
    } catch (err) {
      console.error('Error in logoutUser:', err?.message);
      throw new BadRequestException(err?.message || 'Logout failed');
    }
  }

  @MessagePattern({ cmd: 'verify_otp' })
  async verifyOtp(@Payload() data: VerifyOtpDto): Promise<{ message: string }> {
    try {
      const message = await this.usersService.verifyOtp(data.email, data.otp);
      return { message };
    } catch (err) {
      console.error('Error in verifyOtp:', err?.message);
      throw new BadRequestException(err?.message || 'OTP verification failed');
    }
  }

  @MessagePattern()
  handleUnknown(@Payload() data: any) {
    console.warn('Received unknown message pattern:', data);
  }
}
