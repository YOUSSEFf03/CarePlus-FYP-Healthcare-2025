// Replace your existing app.service.ts with this
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh_token.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AppService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(data: RegisterUserDto): Promise<AuthResponseDto> {
    try {
      const user = await this.usersService.createUser(data);
      if (!user) {
        throw new Error('User registration failed');
      }

      const tokens = await this.usersService.generateTokens(user);
      
      // Get user profile with role-specific data
      const userProfile = await this.usersService.getUserProfile({ userId: user.id });
      
      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_in: '15m',
        token_type: 'Bearer',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          date_of_birth: userProfile?.date_of_birth,
          gender: userProfile?.gender,
          medical_history: userProfile?.medical_history,
        },
      };
    } catch (err) {
      console.error('Error in registerUser:', err?.message);
      throw err;
    }
  }

  async loginUser(data: LoginUserDto): Promise<AuthResponseDto> {
    try {
      const userWithTokens = await this.usersService.login(
        data.email,
        data.password,
      );

      // Get user data
      const user = await this.usersService.findByEmail(data.email);
      if (!user) {
        throw new Error('User not found');
      }

      // Get user profile with role-specific data
      const userProfile = await this.usersService.getUserProfile({ userId: user.id });

      return {
        access_token: userWithTokens.access_token,
        refresh_token: userWithTokens.refresh_token,
        expires_in: '30m',
        token_type: 'Bearer',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          date_of_birth: userProfile?.date_of_birth,
          gender: userProfile?.gender,
          medical_history: userProfile?.medical_history,
        },
      };
    } catch (err) {
      console.error('Error in loginUser:', err?.message);
      throw err;
    }
  }

  async refreshToken(data: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      const tokens = await this.usersService.refreshUserToken(
        data.refresh_token,
      );

      // Get user data from the refresh token
      const payload = this.jwtService.verify(data.refresh_token);
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new Error('User not found');
      }

      // Get user profile with role-specific data
      const userProfile = await this.usersService.getUserProfile({ userId: user.id });

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: '15m',
        token_type: 'Bearer',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          date_of_birth: userProfile?.date_of_birth,
          gender: userProfile?.gender,
          medical_history: userProfile?.medical_history,
        },
      };
    } catch (err) {
      console.error('Error in refreshToken:', err?.message);
      throw err;
    }
  }

  async logoutUser(data: { userId: string }) {
    try {
      await this.usersService.logout(data.userId);
      return { message: 'Logged out successfully' };
    } catch (err) {
      console.error('Error in logoutUser:', err?.message);
      throw err;
    }
  }

  async verifyOtp(data: VerifyOtpDto): Promise<{ message: string }> {
    try {
      const message = await this.usersService.verifyOtp(data.email, data.otp);
      return { message };
    } catch (err) {
      console.error('Error in verifyOtp:', err?.message);
      throw err;
    }
  }

  async resendOtp(data: ResendOtpDto): Promise<{ message: string }> {
    try {
      const message = await this.usersService.resendOtp(data.email);
      return { message };
    } catch (err) {
      console.error('Error in resendOtp:', err?.message);
      throw err;
    }
  }

  async getUserProfile(data: { userId: string }) {
    try {
      const user = await this.usersService.findById(data.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const { password, refresh_token, otp_code, otp_expiry, ...safeUser } =
        user;
      return safeUser;
    } catch (err) {
      console.error('Error in getUserProfile:', err?.message);
      throw err;
    }
  }

  async updateUserProfile(data: UpdateProfileDto) {
    try {
      const user = await this.usersService.findById(data.userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (data.name) user.name = data.name;
      if (data.phone) user.phone = data.phone;
      if (data.profile_picture_url)
        user.profile_picture_url = data.profile_picture_url;

      const updatedUser = await this.usersService.updateUser(user);

      const { password, refresh_token, otp_code, otp_expiry, ...safeUser } =
        updatedUser;
      return safeUser;
    } catch (err) {
      console.error('Error in updateUserProfile:', err?.message);
      throw err;
    }
  }

  async changePassword(data: ChangePasswordDto) {
    try {
      const result = await this.usersService.changePassword(
        data.userId,
        data.currentPassword,
        data.newPassword,
      );
      return { message: result };
    } catch (err) {
      console.error('Error in changePassword:', err?.message);
      throw err;
    }
  }

  async forgotPassword(data: ForgotPasswordDto) {
    try {
      const result = await this.usersService.forgotPassword(data.email);
      return { message: result };
    } catch (err) {
      console.error('Error in forgotPassword:', err?.message);
      throw err;
    }
  }

  async resetPassword(data: ResetPasswordDto) {
    try {
      const result = await this.usersService.resetPassword(
        data.email,
        data.otp,
        data.newPassword,
      );
      return { message: result };
    } catch (err) {
      console.error('Error in resetPassword:', err?.message);
      throw err;
    }
  }

  // Token verification method
  async verifyToken(data: { token: string }) {
    try {
      // Verify JWT token
      const payload = this.jwtService.verify(data.token);

      // Get user from database
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new RpcException({
          status: 401,
          message: 'User not found',
        });
      }

      if (!user.is_verified) {
        throw new RpcException({
          status: 401,
          message: 'User account is not verified',
        });
      }

      // Return user info (exclude sensitive fields)
      const { password, refresh_token, otp_code, otp_expiry, ...safeUser } =
        user;
      return safeUser;
    } catch (error) {
      console.error('Error verifying token:', error);
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        status: 401,
        message: 'Invalid or expired token',
      });
    }
  }

  handleUnknown(data: any) {
    console.warn('Received unknown message pattern:', data);
    return { error: 'Unknown command', data };
  }
}
