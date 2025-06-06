// src/guards/role.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RpcException } from '@nestjs/microservices';

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  PHARMACY = 'pharmacy',
  ADMIN = 'admin',
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const rpcContext = context.switchToRpc();
    const data = rpcContext.getData();
    const user = data.user;

    if (!user) {
      throw new RpcException({
        status: 401,
        message: 'User not authenticated',
      });
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new RpcException({
        status: 403,
        message: 'Insufficient permissions',
      });
    }

    return true;
  }
}
