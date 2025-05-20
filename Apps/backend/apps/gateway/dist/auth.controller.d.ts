export declare class AuthController {
    private readonly authServiceClient;
    constructor(authServiceClient: any);
    login(body: any): Promise<any>;
    register(body: any): Promise<any>;
    refreshToken(body: any): Promise<any>;
    logout(body: {
        userId: string;
    }): Promise<any>;
    verifyOtp(body: any): Promise<any>;
}
