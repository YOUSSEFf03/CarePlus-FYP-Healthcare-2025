// src/middleware/auth.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users.service'; // Fixed path

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          status: 401,
          message: 'Access token is required',
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      try {
        // Verify the JWT token
        const payload = this.jwtService.verify(token);

        // Check if user still exists
        const user = await this.usersService.findById(payload.sub);
        if (!user) {
          return res.status(401).json({
            status: 401,
            message: 'User not found',
          });
        }

        // Check if user is verified
        if (!user.is_verified) {
          return res.status(401).json({
            status: 401,
            message: 'User account is not verified',
          });
        }

        // Attach user info to request
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
        };

        next();
      } catch (jwtError) {
        return res.status(401).json({
          status: 401,
          message: 'Invalid or expired token',
        });
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        status: 500,
        message: 'Internal server error',
      });
    }
  }
}
