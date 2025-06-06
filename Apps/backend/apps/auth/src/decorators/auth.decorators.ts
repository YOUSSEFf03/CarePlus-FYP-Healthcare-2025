import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { UserRole } from '../user.entity'; // Fixed path

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const CurrentMicroserviceUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const rpcContext = ctx.switchToRpc();
    const payload = rpcContext.getData();
    return payload.user;
  },
);

export const RequireRoles = (...roles: UserRole[]) =>
  SetMetadata('roles', roles);

export const Public = () => SetMetadata('isPublic', true);
