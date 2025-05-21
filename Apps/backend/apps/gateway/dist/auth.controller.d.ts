import { ClientProxy } from '@nestjs/microservices';
export declare class AuthController {
    private readonly authServiceClient;
    constructor(authServiceClient: ClientProxy);
    handleRequest(pattern: any, body: any, fallbackMsg: string): Promise<any>;
    login(body: any): Promise<any>;
    register(body: any): Promise<any>;
    refreshToken(body: any): Promise<any>;
    logout(body: {
        userId: string;
    }): Promise<any>;
    verifyOtp(body: any): Promise<any>;
}
