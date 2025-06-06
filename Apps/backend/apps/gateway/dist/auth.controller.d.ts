import { ClientProxy } from '@nestjs/microservices';
import { AuthenticatedRequest } from './middleware/auth.middleware';
export declare class AuthController {
    private readonly authServiceClient;
    private readonly doctorServiceClient;
    constructor(authServiceClient: ClientProxy, doctorServiceClient: ClientProxy);
    handleRequest(client: ClientProxy, pattern: any, body: any, fallbackMsg: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    private getErrorName;
    login(body: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    register(body: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    refreshToken(body: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    verifyOtp(body: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    resendOtp(body: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    forgotPassword(body: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    resetPassword(body: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getProfile(req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    updateProfile(req: AuthenticatedRequest, body: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    changePassword(req: AuthenticatedRequest, body: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    logout(req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    completeDoctorProfile(req: AuthenticatedRequest, body: {
        consultation_fee?: number;
        available_days?: string[];
        start_time?: string;
        end_time?: string;
    }): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getDoctorProfile(req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            exists: boolean;
            doctor: any;
        };
    } | {
        success: boolean;
        data: {
            exists: boolean;
            doctor?: undefined;
        };
    }>;
}
