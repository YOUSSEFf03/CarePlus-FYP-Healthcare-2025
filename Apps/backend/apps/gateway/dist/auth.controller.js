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
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
let AuthController = class AuthController {
    constructor(authServiceClient, doctorServiceClient) {
        this.authServiceClient = authServiceClient;
        this.doctorServiceClient = doctorServiceClient;
    }
    async handleRequest(client, pattern, body, fallbackMsg) {
        try {
            const result = await (0, rxjs_1.lastValueFrom)(client.send(pattern, body));
            return result;
        }
        catch (err) {
            console.error('Microservice Error:', err);
            let status = err?.status || common_1.HttpStatus.BAD_REQUEST;
            if (typeof status !== 'number' || isNaN(status)) {
                status = common_1.HttpStatus.BAD_REQUEST;
            }
            const message = err?.response?.message || err?.message || fallbackMsg;
            throw new common_1.HttpException(message, status);
        }
    }
    async login(body) {
        return this.handleRequest(this.authServiceClient, { cmd: 'login_user' }, body, 'Login failed');
    }
    async register(body) {
        try {
            const userResult = await this.handleRequest(this.authServiceClient, { cmd: 'register_user' }, body, 'Registration failed');
            return userResult;
        }
        catch (error) {
            throw error;
        }
    }
    async refreshToken(body) {
        return this.handleRequest(this.authServiceClient, { cmd: 'refresh_token' }, body, 'Token refresh failed');
    }
    async logout(body) {
        return this.handleRequest(this.authServiceClient, { cmd: 'logout_user' }, body, 'Logout failed');
    }
    async verifyOtp(body) {
        return this.handleRequest(this.authServiceClient, { cmd: 'verify_otp' }, body, 'OTP verification failed');
    }
    async completeDoctorProfile(body) {
        return this.handleRequest(this.doctorServiceClient, { cmd: 'update_doctor_profile' }, { userId: body.userId, updates: body }, 'Failed to complete doctor profile');
    }
    async checkDoctorProfile(body) {
        try {
            const doctor = await this.handleRequest(this.doctorServiceClient, { cmd: 'get_doctor_by_user_id' }, body, 'Doctor profile not found');
            return { exists: true, doctor };
        }
        catch (error) {
            if (error.status === 404) {
                return { exists: false };
            }
            throw error;
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
__decorate([
    (0, common_1.Post)('doctor/complete-profile'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "completeDoctorProfile", null);
__decorate([
    (0, common_1.Post)('doctor/check-profile'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkDoctorProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __param(0, (0, common_1.Inject)('AUTH_SERVICE_CLIENT')),
    __param(1, (0, common_1.Inject)('DOCTOR_SERVICE_CLIENT')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy,
        microservices_1.ClientProxy])
], AuthController);
//# sourceMappingURL=auth.controller.js.map