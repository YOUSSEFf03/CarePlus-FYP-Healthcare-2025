// src/guards/microservice-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { UsersService } from '../users.service'; // Fixed path

@Injectable()
export class MicroserviceAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rpcContext = context.switchToRpc();
    const data = rpcContext.getData();

    // Extract token from the message data
    const token = data?.token || data?.access_token;

    if (!token) {
      throw new RpcException({
        status: 401,
        message: 'Access token is required',
      });
    }

    try {
      // Verify the JWT token
      const payload = this.jwtService.verify(token);

      // Check if user still exists
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new RpcException({
          status: 401,
          message: 'User not found',
        });
      }

      // Check if user is verified
      if (!user.is_verified) {
        throw new RpcException({
          status: 401,
          message: 'User account is not verified',
        });
      }

      // Attach user info to the data context
      data.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      return true;
    } catch (jwtError) {
      if (jwtError instanceof RpcException) {
        throw jwtError;
      }

      throw new RpcException({
        status: 401,
        message: 'Invalid or expired token',
      });
    }
  }
}
