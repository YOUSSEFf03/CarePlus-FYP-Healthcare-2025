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
const pharmacy_controller_1 = require("./pharmacy.controller");
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
const PharmacyServiceClient = microservices_1.ClientsModule.register([
    {
        name: 'PHARMACY_SERVICE_CLIENT',
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
            queue: 'pharmacy_queue',
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
            .forRoutes({ path: 'auth/profile', method: common_2.RequestMethod.GET }, { path: 'auth/profile', method: common_2.RequestMethod.PUT }, { path: 'doctors/workplaces', method: common_2.RequestMethod.GET }, { path: 'doctors/workplaces', method: common_2.RequestMethod.POST }, { path: 'doctors/workplaces/:workplaceId', method: common_2.RequestMethod.PUT }, { path: 'doctors/workplaces/:workplaceId', method: common_2.RequestMethod.DELETE }, { path: 'doctors/workplaces/:workplaceId/availability', method: common_2.RequestMethod.PUT }, { path: 'doctors/workplaces/:workplaceId/assistants', method: common_2.RequestMethod.GET }, { path: 'doctors/workplaces/:workplaceId/assistants', method: common_2.RequestMethod.POST }, { path: 'doctors/workplaces/:workplaceId/assistants/:assistantId', method: common_2.RequestMethod.DELETE }, { path: 'doctors/workplaces/:workplaceId/appointment-slots', method: common_2.RequestMethod.GET }, { path: 'doctors/workplaces/:workplaceId/appointment-slots', method: common_2.RequestMethod.POST }, { path: 'doctors/workplaces/:workplaceId/appointment-slots', method: common_2.RequestMethod.DELETE }, { path: 'doctors/workplaces/:workplaceId/appointment-slots/status', method: common_2.RequestMethod.PUT }, { path: 'doctors/appointments', method: common_2.RequestMethod.GET }, { path: 'doctors/appointments/me', method: common_2.RequestMethod.GET }, { path: 'doctors/appointments/my-bookings', method: common_2.RequestMethod.GET }, { path: 'doctors/appointments/next-upcoming', method: common_2.RequestMethod.GET }, { path: 'doctors/specializations', method: common_2.RequestMethod.GET }, { path: 'doctors/specializations/top', method: common_2.RequestMethod.GET }, { path: 'doctors/specializations/search', method: common_2.RequestMethod.GET }, { path: 'doctors/top-rated', method: common_2.RequestMethod.GET }, { path: 'doctors/most-popular', method: common_2.RequestMethod.GET }, { path: 'doctors/search', method: common_2.RequestMethod.GET }, { path: 'doctors/workplaces', method: common_2.RequestMethod.GET }, { path: 'doctors/:id', method: common_2.RequestMethod.GET }, { path: 'doctors/:id/workplaces', method: common_2.RequestMethod.GET }, { path: 'doctors/analytics/monthly', method: common_2.RequestMethod.GET }, { path: 'doctors/appointments/statistics', method: common_2.RequestMethod.GET }, { path: 'doctors/profile/me', method: common_2.RequestMethod.GET }, { path: 'doctors/profile/me', method: common_2.RequestMethod.PUT }, { path: 'notifications', method: common_2.RequestMethod.GET }, { path: 'notifications', method: common_2.RequestMethod.POST }, { path: 'assistants', method: common_2.RequestMethod.GET }, { path: 'assistants', method: common_2.RequestMethod.POST }, { path: 'assistants/doctor/my-assistants', method: common_2.RequestMethod.GET }, { path: 'assistants/doctor/pending-invites', method: common_2.RequestMethod.GET }, { path: 'assistants/doctor/invite', method: common_2.RequestMethod.POST }, { path: 'assistants/doctor/invites/:inviteId', method: common_2.RequestMethod.DELETE }, { path: 'assistants/doctor/remove-assistant', method: common_2.RequestMethod.DELETE }, { path: 'pharmacy/orders', method: common_2.RequestMethod.GET }, { path: 'pharmacy/orders', method: common_2.RequestMethod.POST }, { path: 'pharmacy/profile', method: common_2.RequestMethod.GET }, { path: 'pharmacy/profile', method: common_2.RequestMethod.PUT }, { path: 'pharmacy/dashboard/stats', method: common_2.RequestMethod.GET }, { path: 'pharmacy/dashboard/top-products', method: common_2.RequestMethod.GET }, { path: 'pharmacy/dashboard/recent-activity', method: common_2.RequestMethod.GET });
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
            PharmacyServiceClient,
        ],
        controllers: [
            auth_controller_1.AuthController,
            doctor_controller_1.DoctorController,
            notification_controller_1.NotificationController,
            assistant_controller_1.AssistantController,
            pharmacy_controller_1.PharmacyController,
        ],
        providers: [auth_middleware_1.AuthMiddleware],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map