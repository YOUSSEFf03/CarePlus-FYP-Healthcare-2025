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
import * as jwt from 'jsonwebtoken';

@Injectable()
export class MicroserviceAuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rpcContext = context.switchToRpc();
    const data = rpcContext.getData();

    console.log('=== MICROSERVICE AUTH GUARD ===');
    console.log('Data received:', JSON.stringify(data, null, 2));

    // Extract token from the message data
    const token = data?.token || data?.access_token;

    console.log('Token extracted:', token ? 'Present' : 'Missing');
    console.log('Token length:', token?.length || 0);

    if (!token) {
      console.log('No token found in data');
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

      // FALLBACK: If auth service is not available, try local JWT verification
      console.log('Auth service unavailable, trying local JWT verification...');
      try {
        const decoded = jwt.verify(token, 'fallback-secret-key') as any;
        console.log('Local JWT verification successful:', decoded);
        
        data.user = {
          id: decoded.sub,
          email: decoded.email,
          role: decoded.role,
        };
        
        return true;
      } catch (jwtError) {
        console.error('Local JWT verification failed:', jwtError);
        throw new RpcException({
          status: 401,
          message: 'Token verification failed',
        });
      }
    }
  }
}
