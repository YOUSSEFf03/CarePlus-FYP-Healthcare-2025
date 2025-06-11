// src/decorators/auth.decorators.ts
import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { UserRole } from '../guards/role.guard';

// Decorator to get current user from microservice context
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const rpcContext = ctx.switchToRpc();
    const payload = rpcContext.getData();
    return payload.user;
  },
);

// Decorator to set required roles
export const RequireRoles = (...roles: UserRole[]) =>
  SetMetadata('roles', roles);

// Decorator to mark routes as public (skip auth)
export const Public = () => SetMetadata('isPublic', true);

// Decorator specifically for doctor-only routes
export const DoctorOnly = () => RequireRoles(UserRole.DOCTOR);

// Decorator specifically for admin-only routes
export const AdminOnly = () => RequireRoles(UserRole.ADMIN);

// Decorator for admin or doctor access
export const AdminOrDoctor = () =>
  RequireRoles(UserRole.ADMIN, UserRole.DOCTOR);
