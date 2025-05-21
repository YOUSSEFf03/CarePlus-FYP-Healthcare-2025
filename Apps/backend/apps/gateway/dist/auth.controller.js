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
    constructor(authServiceClient) {
        this.authServiceClient = authServiceClient;
    }
    async handleRequest(pattern, body, fallbackMsg) {
        try {
            const result = await (0, rxjs_1.lastValueFrom)(this.authServiceClient.send(pattern, body));
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
        return this.handleRequest({ cmd: 'login_user' }, body, 'Login failed');
    }
    async register(body) {
        return this.handleRequest({ cmd: 'register_user' }, body, 'Registration failed');
    }
    async refreshToken(body) {
        return this.handleRequest({ cmd: 'refresh_token' }, body, 'Token refresh failed');
    }
    async logout(body) {
        return this.handleRequest({ cmd: 'logout_user' }, body, 'Logout failed');
    }
    async verifyOtp(body) {
        return this.handleRequest({ cmd: 'verify_otp' }, body, 'OTP verification failed');
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
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], AuthController);
//# sourceMappingURL=auth.controller.js.map