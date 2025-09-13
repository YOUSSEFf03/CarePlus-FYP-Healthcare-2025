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
    console.log('=== AUTH MIDDLEWARE CALLED ===', req.path, req.method);

    // Check if this is a public route that doesn't need authentication
    const publicRoutes = [
      { path: '/doctors', method: 'GET' }, // GET /doctors (list all doctors)
      { path: '/doctors/stats', method: 'GET' }, // GET /doctors/stats (general stats)
    ];

    const isPublicRoute = publicRoutes.some(
      (route) => req.path === route.path && req.method === route.method,
    );

    // Also check for parameterized public routes
    const publicRoutePatterns = [
      { pattern: /^\/doctors\/[^\/]+\/reviews$/, method: 'GET' },
      { pattern: /^\/doctors\/[^\/]+\/available-slots$/, method: 'GET' },
      { pattern: /^\/doctors\/[^\/]+\/stats$/, method: 'GET' },
      // Only match UUID-like patterns for doctor IDs (not words like 'test-middleware' or 'workplaces')
      {
        pattern:
          /^\/doctors\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        method: 'GET',
      },
    ];

    const isPublicPattern = publicRoutePatterns.some(
      (route) => route.pattern.test(req.path) && req.method === route.method,
    );

    if (isPublicRoute || isPublicPattern) {
      console.log('Public route detected, skipping authentication:', req.path);
      next();
      return;
    }

    try {
      console.log('Auth middleware started for:', req.path);
      const authHeader = req.headers.authorization;
      console.log('Auth header present:', !!authHeader);

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
