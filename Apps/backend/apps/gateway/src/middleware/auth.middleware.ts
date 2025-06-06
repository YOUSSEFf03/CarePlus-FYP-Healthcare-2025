// src/middleware/auth.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  token?: string;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject('AUTH_SERVICE_CLIENT')
    private readonly authClient: ClientProxy,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          status: 401,
          message: 'Access token is required',
          error: 'Unauthorized',
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      try {
        // Verify token with auth service
        const userInfo = await lastValueFrom(
          this.authClient.send({ cmd: 'verify_token' }, { token }),
        );

        if (!userInfo || !userInfo.id) {
          return res.status(401).json({
            success: false,
            status: 401,
            message: 'Invalid token',
            error: 'Unauthorized',
          });
        }

        // Attach user info and token to request
        req.user = {
          id: userInfo.id,
          email: userInfo.email,
          role: userInfo.role,
        };
        req.token = token; // Store token to pass to microservices

        next();
      } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
          success: false,
          status: 401,
          message: 'Invalid or expired token',
          error: 'Unauthorized',
        });
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      });
    }
  }
}
