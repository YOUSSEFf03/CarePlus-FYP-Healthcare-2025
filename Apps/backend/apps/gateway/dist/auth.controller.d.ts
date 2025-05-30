import { ClientProxy } from '@nestjs/microservices';
export declare class AuthController {
    private readonly authServiceClient;
    private readonly doctorServiceClient;
    constructor(authServiceClient: ClientProxy, doctorServiceClient: ClientProxy);
    handleRequest(client: ClientProxy, pattern: any, body: any, fallbackMsg: string): Promise<any>;
    login(body: any): Promise<any>;
    register(body: any): Promise<any>;
    refreshToken(body: any): Promise<any>;
    logout(body: {
        userId: string;
    }): Promise<any>;
    verifyOtp(body: any): Promise<any>;
    completeDoctorProfile(body: {
        userId: string;
        consultation_fee?: number;
        available_days?: string[];
        start_time?: string;
        end_time?: string;
    }): Promise<any>;
    checkDoctorProfile(body: {
        userId: string;
    }): Promise<{
        exists: boolean;
        doctor: any;
    } | {
        exists: boolean;
        doctor?: undefined;
    }>;
}
