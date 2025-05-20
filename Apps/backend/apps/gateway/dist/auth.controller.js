"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
let AuthController = class AuthController {
    constructor(authServiceClient) {
        this.authServiceClient = authServiceClient;
    }
    async login(body) {
        try {
            return await this.authServiceClient
                .send({ cmd: 'login_user' }, body)
                .toPromise();
        }
        catch (err) {
            console.error('Microservice error (login):', err?.message);
            throw new common_1.BadRequestException(err?.message || 'Login failed');
        }
    }
    async register(body) {
        try {
            return await this.authServiceClient
                .send({ cmd: 'register_user' }, body)
                .toPromise();
        }
        catch (err) {
            console.error('Microservice error (register):', err?.message);
            throw new common_1.BadRequestException(err?.message || 'Registration failed');
        }
    }
    async refreshToken(body) {
        try {
            return await this.authServiceClient
                .send({ cmd: 'refresh_token' }, body)
                .toPromise();
        }
        catch (err) {
            console.error('Microservice error (refresh_token):', err?.message);
            throw new common_1.BadRequestException(err?.message || 'Token refresh failed');
        }
    }
    async logout(body) {
        try {
            return await this.authServiceClient
                .send({ cmd: 'logout_user' }, body)
                .toPromise();
        }
        catch (err) {
            console.error('Microservice error (logout):', err?.message);
            throw new common_1.BadRequestException(err?.message || 'Logout failed');
        }
    }
    async verifyOtp(body) {
        try {
            return await this.authServiceClient
                .send({ cmd: 'verify_otp' }, body)
                .toPromise();
        }
        catch (err) {
            console.error('Microservice error (verify_otp):', err?.message);
            throw new common_1.BadRequestException(err?.message || 'OTP verification failed');
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('refresh-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __param(0, (0, common_1.Inject)('AUTH_SERVICE_CLIENT')),
    __metadata("design:paramtypes", [Object])
], AuthController);
//# sourceMappingURL=auth.controller.js.map