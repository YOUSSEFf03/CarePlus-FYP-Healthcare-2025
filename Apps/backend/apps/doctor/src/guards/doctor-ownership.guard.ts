// src/guards/doctor-ownership.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { DoctorService } from '../doctor.service';
import { UserRole } from './role.guard';

@Injectable()
export class DoctorOwnershipGuard implements CanActivate {
  constructor(private readonly doctorService: DoctorService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rpcContext = context.switchToRpc();
    const data = rpcContext.getData();
    const user = data.user;

    if (!user) {
      throw new RpcException({
        status: 401,
        message: 'User not authenticated',
      });
    }

    // Admins can access everything
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // For doctors, check if they own the resource
    if (user.role === UserRole.DOCTOR) {
      try {
        // Get doctorId from the request data
        const doctorId = data.doctorId || data.id;

        if (doctorId) {
          // Check if the doctor profile belongs to the authenticated user
          const doctor = await this.doctorService.getDoctorById(doctorId);
          return doctor.userId === user.id;
        }

        // If no doctorId provided, check if user has a doctor profile
        const doctor = await this.doctorService.getDoctorByUserId(user.id);
        return !!doctor;
      } catch (error) {
        return false;
      }
    }

    return false;
  }
}
