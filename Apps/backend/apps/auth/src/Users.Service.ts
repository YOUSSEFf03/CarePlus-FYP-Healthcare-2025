import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';
import { Patient } from './patient.entity';
import { Pharmacy } from './pharmacy.entity';
import { Doctor } from './doctor.entity';
import { Address } from './address.entity';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Pharmacy)
    private readonly pharmacyRepo: Repository<Pharmacy>,

    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,

    private readonly jwtService: JwtService,

    @Inject('DOCTOR_SERVICE')
    private readonly doctorClient: ClientProxy,

    @Inject('NOTIFICATION_SERVICE') // ← NEW: Inject notification service
    private readonly notificationClient: ClientProxy,
  ) {}

  private rpcError(message: string, status = 400) {
    return new RpcException({ status, message });
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone: string;
    profile_picture_url?: string;
    date_of_birth?: string;
    gender?: string;
    medical_history?: string;
    specialization?: string;
    license_number?: string;
    dr_idCard_url?: string;
    biography?: string;
    medical_license_url?: string;
    verification_status?: string;
    pharmacy_owner?: string;
    pharmacy_name?: string;
  }): Promise<User> {
    try {
      // Check if user already exists
      const existing = await this.userRepo.findOne({
        where: { email: data.email },
      });
      if (existing) {
        throw this.rpcError('Email already registered', 409);
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = this.userRepo.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        phone: data.phone,
        profile_picture_url: data.profile_picture_url,
      });

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp_code = otp;
      user.otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      user.is_verified = false;

      // Save user
      const savedUser = await this.userRepo.save(user);

      // Send OTP via Notification Service
      try {
        await this.sendOtpNotification(savedUser, otp);
      } catch (otpError) {
        console.error('Failed to send OTP via notification service:', otpError);
        // Don't throw error, continue with user creation
        // User will need to verify OTP later
      }

      // Handle role-specific data
      if (data.role === UserRole.PATIENT) {
        console.log('Creating patient profile...');
        await this.createPatientProfile(savedUser, data);
      } else if (data.role === UserRole.DOCTOR) {
        console.log('Creating doctor profile...');
        await this.createDoctorProfile(savedUser, data);
      } else if (data.role === UserRole.PHARMACY) {
        console.log('Creating pharmacy profile...');
        await this.createPharmacyProfile(savedUser, data);
      }

      return savedUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // ==================== NOTIFICATION METHODS ====================

  private async sendOtpNotification(user: User, otp: string): Promise<void> {
    try {
      // Send email OTP
      const emailResult = await firstValueFrom(
        this.notificationClient.send(
          { cmd: 'send_otp' },
          {
            userId: user.id,
            type: 'EMAIL',
            recipient: user.email,
            otp: otp,
            userName: user.name,
          },
        ),
      );

      console.log('✅ Email OTP sent via notification service:', emailResult);

      // Send WhatsApp OTP (if phone provided)
      if (user.phone) {
        const whatsappResult = await firstValueFrom(
          this.notificationClient.send(
            { cmd: 'send_otp' },
            {
              userId: user.id,
              type: 'WHATSAPP',
              recipient: user.phone,
              otp: otp,
              userName: user.name,
            },
          ),
        );

        console.log(
          '✅ WhatsApp OTP sent via notification service:',
          whatsappResult,
        );
      }
    } catch (error) {
      console.error('❌ Failed to send OTP via notification service:', error);
      throw error;
    }
  }

  private async sendPasswordResetNotification(
    user: User,
    otp: string,
  ): Promise<void> {
    try {
      const result = await firstValueFrom(
        this.notificationClient.send(
          { cmd: 'send_password_reset_email' },
          {
            userId: user.id,
            email: user.email,
            otp: otp,
            userName: user.name,
          },
        ),
      );

      console.log(
        '✅ Password reset email sent via notification service:',
        result,
      );
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw error;
    }
  }

  // ==================== EXISTING METHODS (Updated) ====================

  private async createPatientProfile(user: User, data: any): Promise<void> {
    console.log('Creating patient profile with data:', {
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      medical_history: data.medical_history
    });

    if (!data.date_of_birth || !data.gender) {
      console.error('Missing required patient details:', {
        hasDateOfBirth: !!data.date_of_birth,
        hasGender: !!data.gender,
        dateOfBirth: data.date_of_birth,
        gender: data.gender
      });
      throw this.rpcError(
        'Missing required patient details: date_of_birth and gender are required',
      );
    }

    try {
      const patient = this.patientRepo.create({
        user: user,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        medical_history: data.medical_history || null, // Use null instead of empty string
      });
      const savedPatient = await this.patientRepo.save(patient);
      console.log('Patient profile created successfully:', savedPatient.id);
    } catch (error) {
      console.error('Error creating patient profile:', error);
      throw this.rpcError(`Failed to create patient profile: ${error.message}`);
    }
  }

  private async createDoctorProfile(user: User, data: any): Promise<void> {
    if (
      !data.specialization ||
      !data.license_number ||
      !data.dr_idCard_url ||
      !data.biography ||
      !data.medical_license_url
    ) {
      throw this.rpcError(
        'Missing required doctor details: specialization, license_number, dr_idCard_url, biography, and medical_license_url are required',
      );
    }

    try {
      // Send to doctor microservice
      const doctorData = {
        userId: user.id,
        specialization: data.specialization,
        license_number: data.license_number,
        dr_idCard_url: data.dr_idCard_url,
        biography: data.biography,
        medical_license_url: data.medical_license_url,
        verification_status: data.verification_status || 'pending',
      };

      // Use emit instead of send for fire-and-forget
      this.doctorClient.emit('create_doctor', doctorData);
      console.log('Doctor profile creation sent to doctor service');
    } catch (error) {
      console.error('Error sending doctor data to microservice:', error);
      throw this.rpcError('Failed to create doctor profile');
    }
  }

  private async createPharmacyProfile(user: User, data: any): Promise<void> {
    console.log('Creating pharmacy profile for user:', user.id);
    console.log('Pharmacy data received:', {
      pharmacy_owner: data.pharmacy_owner,
      pharmacy_name: data.pharmacy_name,
      latitude: data.latitude,
      longitude: data.longitude,
      street: data.street,
      city: data.city,
      state: data.state,
      country: data.country,
    });
    
    if (!data.pharmacy_owner || !data.pharmacy_name) {
      console.log('Missing pharmacy details, skipping pharmacy profile creation');
      return; // Don't throw error, just skip
    }

    try {
      const pharmacy = this.pharmacyRepo.create({
        user: user,
        pharmacy_owner: data.pharmacy_owner,
        pharmacy_name: data.pharmacy_name,
        pharmacy_license: data.pharmacy_license || null,
      });
      const savedPharmacy = await this.pharmacyRepo.save(pharmacy);
      console.log('Pharmacy created successfully:', savedPharmacy.id);

      // Address creation completely disabled to prevent RLS errors
      console.log('Pharmacy profile created successfully, skipping address creation');
    } catch (error) {
      console.error('Error creating pharmacy profile:', error);
      // Don't throw error for pharmacy profile creation failure
      // The user is already created, so we can continue
      console.log('Continuing without pharmacy profile creation...');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepo.findOne({ where: { email } });
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await this.userRepo.findOne({ where: { id } });
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  async getUserProfile(data: { userId: string }): Promise<any> {
    try {
      const user = await this.userRepo.findOne({ 
        where: { id: data.userId }
      });

      if (!user) {
        throw this.rpcError('User not found', 404);
      }

      // Get role-specific profile data by querying the respective tables
      if (user.role === UserRole.PATIENT) {
        const patient = await this.patientRepo.findOne({ 
          where: { user: { id: data.userId } } 
        });
        if (patient) {
          return {
            date_of_birth: patient.date_of_birth,
            gender: patient.gender,
            medical_history: patient.medical_history,
          };
        }
      } else if (user.role === UserRole.DOCTOR) {
        const doctor = await this.doctorRepo.findOne({ 
          where: { user: { id: data.userId } } 
        });
        if (doctor) {
          return {
            specialization: doctor.specialization,
            license_number: doctor.license_number,
            biography: doctor.biography,
          };
        }
      } else if (user.role === UserRole.PHARMACY) {
        const pharmacy = await this.pharmacyRepo.findOne({ 
          where: { user: { id: data.userId } } 
        });
        if (pharmacy) {
          return {
            pharmacy_name: pharmacy.pharmacy_name,
            pharmacy_owner: pharmacy.pharmacy_owner,
            pharmacy_license: pharmacy.pharmacy_license,
          };
        }
      }

      return {};
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw this.rpcError('Failed to get user profile');
    }
  }

  async validateUser(
    email: string,
    plainPassword: string,
  ): Promise<User | null> {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        return null;
      }

      if (!user.is_verified) {
        throw this.rpcError('Please verify your email before logging in', 401);
      }

      const isPasswordValid = await bcrypt.compare(
        plainPassword,
        user.password,
      );
      return isPasswordValid ? user : null;
    } catch (error) {
      console.error('Error validating user:', error);
      throw error;
    }
  }

  async login(
    email: string,
    plainPassword: string,
  ): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    try {
      const user = await this.validateUser(email, plainPassword);
      if (!user) {
        throw this.rpcError('Invalid email or password', 401);
      }

      const tokens = await this.generateTokens(user);
      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      };
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(payload, {
        expiresIn: '15m',
      });

      const refreshToken = this.jwtService.sign(
        { sub: user.id },
        { expiresIn: '7d' },
      );

      // Hash and store refresh token
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await this.userRepo.update(user.id, {
        refresh_token: hashedRefreshToken,
      });

      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error generating tokens:', error);
      throw this.rpcError('Failed to generate tokens');
    }
  }

  async refreshUserToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.findById(payload.sub);

      if (!user || !user.refresh_token) {
        throw this.rpcError('Invalid refresh token', 401);
      }

      // Verify the refresh token matches the stored one
      const isTokenValid = await bcrypt.compare(
        refreshToken,
        user.refresh_token,
      );
      if (!isTokenValid) {
        throw this.rpcError('Invalid refresh token', 401);
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);
      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      if (error instanceof RpcException) {
        throw error;
      }
      throw this.rpcError('Invalid or expired refresh token', 401);
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      await this.userRepo.update(userId, { refresh_token: null });
    } catch (error) {
      console.error('Error during logout:', error);
      throw this.rpcError('Failed to logout');
    }
  }

  async verifyOtp(email: string, otp: string): Promise<string> {
    try {
      const user = await this.userRepo.findOne({ where: { email } });

      if (!user) {
        throw this.rpcError('User not found', 404);
      }

      if (user.is_verified) {
        return 'User already verified';
      }

      if (user.otp_code !== otp) {
        throw this.rpcError('Invalid OTP', 400);
      }

      if (!user.otp_expiry || user.otp_expiry < new Date()) {
        throw this.rpcError('OTP has expired', 400);
      }

      // Update user as verified
      user.is_verified = true;
      user.otp_code = null;
      user.otp_expiry = null;

      await this.userRepo.save(user);

      return 'Email verified successfully';
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  async resendOtp(email: string): Promise<string> {
    try {
      const user = await this.userRepo.findOne({ where: { email } });

      if (!user) {
        throw this.rpcError('User not found', 404);
      }

      if (user.is_verified) {
        throw this.rpcError('User is already verified', 400);
      }

      // Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp_code = otp;
      user.otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await this.userRepo.save(user);

      // Send OTP via notification service
      try {
        await this.sendOtpNotification(user, otp);
      } catch (otpError) {
        console.error('Failed to send OTP:', otpError);
        throw this.rpcError('Failed to send OTP');
      }

      return 'OTP sent successfully';
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error;
    }
  }

  async updateUser(user: User): Promise<User> {
    try {
      return await this.userRepo.save(user);
    } catch (error) {
      console.error('Error updating user:', error);
      throw this.rpcError('Failed to update user');
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<string> {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw this.rpcError('User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isCurrentPasswordValid) {
        throw this.rpcError('Current password is incorrect', 400);
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await this.userRepo.update(userId, { password: hashedNewPassword });

      return 'Password changed successfully';
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<string> {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        throw this.rpcError('User not found', 404);
      }

      // Generate OTP for password reset
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp_code = otp;
      user.otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await this.userRepo.save(user);

      // Send password reset email via notification service
      try {
        await this.sendPasswordResetNotification(user, otp);
      } catch (otpError) {
        console.error('Failed to send password reset OTP:', otpError);
        throw this.rpcError('Failed to send password reset OTP');
      }

      return 'Password reset OTP sent successfully';
    } catch (error) {
      console.error('Error in forgot password:', error);
      throw error;
    }
  }

  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<string> {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        throw this.rpcError('User not found', 404);
      }

      if (user.otp_code !== otp) {
        throw this.rpcError('Invalid OTP', 400);
      }

      if (!user.otp_expiry || user.otp_expiry < new Date()) {
        throw this.rpcError('OTP has expired', 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear OTP
      user.password = hashedPassword;
      user.otp_code = null;
      user.otp_expiry = null;
      user.refresh_token = null; // Invalidate all sessions

      await this.userRepo.save(user);

      return 'Password reset successfully';
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
}
