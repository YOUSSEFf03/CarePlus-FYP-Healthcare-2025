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
    async registerAssistant(body) {
        try {
            const assistantData = {
                ...body,
                role: 'assistant',
            };
            const result = await (0, rxjs_1.lastValueFrom)(this.authServiceClient.send({ cmd: 'register_user' }, assistantData));
            return {
                success: true,
                data: result,
                message: 'Assistant registered successfully',
            };
        }
        catch (error) {
            throw error;
        }
    }
    async handleRequest(client, pattern, body, fallbackMsg) {
        try {
            const result = await (0, rxjs_1.lastValueFrom)(client.send(pattern, body));
            return {
                success: true,
                data: result,
                message: 'Operation successful',
            };
        }
        catch (err) {
            console.error('Microservice Error:', err);
            let status = err?.status || common_1.HttpStatus.BAD_REQUEST;
            if (typeof status !== 'number' || isNaN(status)) {
                status = common_1.HttpStatus.BAD_REQUEST;
            }
            const message = err?.response?.message || err?.message || fallbackMsg;
            throw new common_1.HttpException({
                success: false,
                status,
                message,
                error: this.getErrorName(status),
            }, status);
        }
    }
    getErrorName(status) {
        switch (status) {
            case common_1.HttpStatus.BAD_REQUEST:
                return 'Bad Request';
            case common_1.HttpStatus.UNAUTHORIZED:
                return 'Unauthorized';
            case common_1.HttpStatus.FORBIDDEN:
                return 'Forbidden';
            case common_1.HttpStatus.NOT_FOUND:
                return 'Not Found';
            case common_1.HttpStatus.CONFLICT:
                return 'Conflict';
            default:
                return 'Internal Server Error';
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
    async verifyOtp(body) {
        return this.handleRequest(this.authServiceClient, { cmd: 'verify_otp' }, body, 'OTP verification failed');
    }
    async resendOtp(body) {
        return this.handleRequest(this.authServiceClient, { cmd: 'resend_otp' }, body, 'Failed to resend OTP');
    }
    async forgotPassword(body) {
        return this.handleRequest(this.authServiceClient, { cmd: 'forgot_password' }, body, 'Failed to send reset password OTP');
    }
    async resetPassword(body) {
        return this.handleRequest(this.authServiceClient, { cmd: 'reset_password' }, body, 'Failed to reset password');
    }
    async sendPhoneOtp(body) {
        return this.handleRequest(this.authServiceClient, { cmd: 'send_phone_otp' }, body, 'Failed to send phone OTP');
    }
    async verifyPhoneOtp(body) {
        return this.handleRequest(this.authServiceClient, { cmd: 'verify_phone_otp' }, body, 'Failed to verify phone OTP');
    }
    async debugUsers() {
        return this.handleRequest(this.authServiceClient, { cmd: 'debug_users' }, {}, 'Failed to get users');
    }
    async getProfile(req) {
        return this.handleRequest(this.authServiceClient, { cmd: 'get_user_profile' }, { token: req.token }, 'Failed to get profile');
    }
    async updateProfile(req, body) {
        return this.handleRequest(this.authServiceClient, { cmd: 'update_user_profile' }, { token: req.token, ...body }, 'Failed to update profile');
    }
    async changePassword(req, body) {
        return this.handleRequest(this.authServiceClient, { cmd: 'change_password' }, { token: req.token, ...body }, 'Failed to change password');
    }
    async logout(req) {
        return this.handleRequest(this.authServiceClient, { cmd: 'logout_user' }, { token: req.token }, 'Logout failed');
    }
    async completeDoctorProfile(req, body) {
        return this.handleRequest(this.doctorServiceClient, { cmd: 'update_doctor_profile' }, { token: req.token, updates: body }, 'Failed to complete doctor profile');
    }
    async getDoctorProfile(req) {
        try {
            const doctor = await this.handleRequest(this.doctorServiceClient, { cmd: 'get_doctor_by_user_id' }, { token: req.token, userId: req.user.id }, 'Doctor profile not found');
            return { success: true, data: { exists: true, doctor: doctor.data } };
        }
        catch (error) {
            if (error.status === 404) {
                return { success: true, data: { exists: false } };
            }
            throw error;
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register/assistant'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerAssistant", null);
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
    (0, common_1.Post)('verify-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('resend-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendOtp", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('send-phone-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendPhoneOtp", null);
__decorate([
    (0, common_1.Post)('verify-phone-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyPhoneOtp", null);
__decorate([
    (0, common_1.Get)('debug-users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "debugUsers", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Put)('change-password'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('doctor/complete-profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "completeDoctorProfile", null);
__decorate([
    (0, common_1.Get)('doctor/profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getDoctorProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __param(0, (0, common_1.Inject)('AUTH_SERVICE_CLIENT')),
    __param(1, (0, common_1.Inject)('DOCTOR_SERVICE_CLIENT')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy,
        microservices_1.ClientProxy])
], AuthController);
//# sourceMappingURL=auth.controller.js.map