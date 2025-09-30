// src/middleware/auth.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

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
    console.log('=== AUTH MIDDLEWARE CALLED ===', req.path, req.method);
    console.log('=== AUTH MIDDLEWARE - Full URL:', req.url);
    console.log('=== AUTH MIDDLEWARE - Headers:', JSON.stringify(req.headers, null, 2));

    try {
      console.log('Auth middleware started for:', req.path);
      const authHeader = req.headers.authorization;
      console.log('Auth header present:', !!authHeader);
      console.log('Auth header value:', authHeader);

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No valid auth header found');
        return res.status(401).json({
          success: false,
          status: 401,
          message: 'Access token is required',
          error: 'Unauthorized',
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      console.log('Token extracted, length:', token.length);

      try {
        console.log('Sending token verification request to auth service...');
        // Verify token with auth service
        const userInfo = await lastValueFrom(
          this.authClient.send({ cmd: 'verify_token' }, { token }),
        );
        console.log('Auth service response:', userInfo);

        if (!userInfo || !userInfo.id) {
          console.log('Invalid user info from auth service');
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
        console.log('User info attached to request:', req.user);

        next();
      } catch (error) {
        console.error('Token verification error:', error);
        
        // TEMPORARY FALLBACK: If auth service is not available, decode JWT locally
        console.log('Auth service unavailable, trying local JWT decode...');
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as JwtPayload;
          console.log('Local JWT decode successful:', decoded);
          
          req.user = {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role,
          };
          req.token = token;
          console.log('User info attached from local decode:', req.user);
          
          next();
        } catch (jwtError) {
          console.error('Local JWT decode failed:', jwtError);
          return res.status(401).json({
            success: false,
            status: 401,
            message: 'Invalid or expired token',
            error: 'Unauthorized',
          });
        }
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
