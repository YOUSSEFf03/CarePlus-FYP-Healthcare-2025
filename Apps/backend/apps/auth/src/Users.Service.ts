import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';
import { Patient } from './patient.entity';
import { Doctor } from './doctor.entity';
import { Pharmacy } from './pharmacy.entity';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from './email.service';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,

    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(Pharmacy)
    private readonly pharmacyRepo: Repository<Pharmacy>,

    private readonly emailService: EmailService,
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
    const existing = await this.userRepo.findOne({
      where: { email: data.email },
    });
    if (existing) {
      throw this.rpcError('Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepo.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      phone: data.phone,
      profile_picture_url: data.profile_picture_url,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp_code = otp;
    user.otp_expiry = new Date(Date.now() + 10 * 60 * 1000);
    user.is_verified = false;

    const savedUser = await this.userRepo.save(user);

    // await this.emailService.sendOTP(user.email, otp);

    if (data.role === 'patient') {
      if (!data.date_of_birth || !data.gender) {
        throw this.rpcError('Missing patient details');
      }
      const patient = this.patientRepo.create({
        user: savedUser,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        medical_history: data.medical_history,
      });
      await this.patientRepo.save(patient);
    } else if (data.role === 'doctor') {
      if (
        !data.specialization ||
        !data.license_number ||
        !data.dr_idCard_url ||
        !data.biography ||
        !data.medical_license_url
      ) {
        throw this.rpcError('Missing doctor details');
      }
      const doctor = this.doctorRepo.create({
        user: savedUser,
        specialization: data.specialization,
        license_number: data.license_number,
        dr_idCard_url: data.dr_idCard_url,
        biography: data.biography,
        medical_license_url: data.medical_license_url,
        verification_status: data.verification_status || 'pending',
      });
      await this.doctorRepo.save(doctor);
    } else if (data.role === 'pharmacy') {
      if (!data.pharmacy_owner || !data.pharmacy_name) {
        throw this.rpcError('Missing pharmacy details');
      }
      const pharmacy = this.pharmacyRepo.create({
        user: savedUser,
        pharmacy_owner: data.pharmacy_owner,
        pharmacy_name: data.pharmacy_name,
      });
      await this.pharmacyRepo.save(pharmacy);
    }
    return savedUser;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepo.findOne({ where: { email } });
  }

  async validateUser(
    email: string,
    plainPassword: string,
  ): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    if (!user.is_verified) {
      throw this.rpcError('Please verify your email before logging in');
    }

    const match = await bcrypt.compare(plainPassword, user.password);
    return match ? user : null;
  }

  async login(
    email: string,
    plainPassword: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.validateUser(email, plainPassword);
    if (!user) {
      throw this.rpcError('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);
    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      {
        expiresIn: '15m',
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        expiresIn: '7d',
      },
    );

    const hashedRT = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.update(user.id, { refresh_token: hashedRT });

    return { accessToken, refreshToken };
  }

  async refreshUserToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user || !user.refresh_token) {
        throw this.rpcError('User not found or not logged in', 404);
      }

      const isValid = await bcrypt.compare(refreshToken, user.refresh_token);
      if (!isValid) {
        throw this.rpcError('Invalid refresh token', 401);
      }

      const tokens = await this.generateTokens(user);
      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      };
    } catch {
      throw this.rpcError('Invalid or expired refresh token', 401);
    }
  }

  async logout(userId: string) {
    await this.userRepo.update(userId, { refresh_token: null });
  }

  async findById(id: string): Promise<User | undefined> {
    return this.userRepo.findOne({ where: { id } });
  }

  async verifyOtp(email: string, otp: string): Promise<string> {
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      throw this.rpcError('User not found', 404);
    }

    if (user.is_verified) {
      return 'User already verified';
    }

    if (user.otp_code !== otp) {
      throw this.rpcError('Invalid OTP');
    }

    if (user.otp_expiry < new Date()) {
      throw this.rpcError('OTP expired');
    }

    user.is_verified = true;
    user.otp_code = null;
    user.otp_expiry = null;

    await this.userRepo.save(user);

    return 'Email verified successfully';
  }
}
