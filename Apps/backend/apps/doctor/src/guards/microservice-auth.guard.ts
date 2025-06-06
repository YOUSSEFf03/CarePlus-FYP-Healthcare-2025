// src/guards/microservice-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MicroserviceAuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
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
      // Call auth service to verify token and get user info
      const userInfo = await firstValueFrom(
        this.authClient.send({ cmd: 'verify_token' }, { token }),
      );

      if (!userInfo || !userInfo.id) {
        throw new RpcException({
          status: 401,
          message: 'Invalid token',
        });
      }

      // Attach user info to the data context
      data.user = {
        id: userInfo.id,
        email: userInfo.email,
        role: userInfo.role,
      };

      return true;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        status: 401,
        message: 'Token verification failed',
      });
    }
  }
}
