"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const microservices_1 = require("@nestjs/microservices");
const auth_controller_1 = require("./auth.controller");
const doctor_controller_1 = require("./doctor.controller");
const auth_middleware_1 = require("./middleware/auth.middleware");
const notification_controller_1 = require("./notification.controller");
const common_2 = require("@nestjs/common");
const assistant_controller_1 = require("./assistant.controller");
const AuthServiceClient = microservices_1.ClientsModule.register([
    {
        name: 'AUTH_SERVICE_CLIENT',
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
            queue: 'auth_queue',
            queueOptions: {
                durable: false,
            },
        },
    },
]);
const DoctorServiceClient = microservices_1.ClientsModule.register([
    {
        name: 'DOCTOR_SERVICE_CLIENT',
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
            queue: 'doctor_queue',
            queueOptions: {
                durable: false,
            },
        },
    },
]);
const NotificationServiceClient = microservices_1.ClientsModule.register([
    {
        name: 'NOTIFICATION_SERVICE_CLIENT',
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
            queue: 'notification_queue',
            queueOptions: {
                durable: false,
            },
        },
    },
]);
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(auth_middleware_1.AuthMiddleware)
            .exclude('auth/login', 'auth/register', 'auth/refresh-token', 'auth/verify-otp', 'auth/resend-otp', 'auth/forgot-password', 'auth/reset-password', 'auth/register/assistant', 'doctors', { path: 'doctors/:id/reviews', method: common_2.RequestMethod.GET }, { path: 'doctors/:id/available-slots', method: common_2.RequestMethod.GET }, { path: 'doctors/:id/stats', method: common_2.RequestMethod.GET }, { path: 'doctors/:id', method: common_2.RequestMethod.GET })
            .forRoutes(auth_controller_1.AuthController, doctor_controller_1.DoctorController, notification_controller_1.NotificationController, assistant_controller_1.AssistantController);
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            AuthServiceClient,
            DoctorServiceClient,
            NotificationServiceClient,
        ],
        controllers: [
            auth_controller_1.AuthController,
            doctor_controller_1.DoctorController,
            notification_controller_1.NotificationController,
            assistant_controller_1.AssistantController,
        ],
        providers: [auth_middleware_1.AuthMiddleware],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map