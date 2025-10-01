import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { DoctorController } from './doctor.controller';
import { AuthMiddleware } from './middleware/auth.middleware';
import { NotificationController } from './notification.controller';
import { RequestMethod } from '@nestjs/common';
import { AssistantController } from './assistant.controller';
import { PharmacyController } from './pharmacy.controller';

const AuthServiceClient = ClientsModule.register([
  {
    name: 'AUTH_SERVICE_CLIENT',
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'auth_queue',
      queueOptions: {
        durable: false,
      },
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
    },
  },
]);

const DoctorServiceClient = ClientsModule.register([
  {
    name: 'DOCTOR_SERVICE_CLIENT',
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'doctor_queue',
      queueOptions: {
        durable: false,
      },
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
    },
  },
]);

const NotificationServiceClient = ClientsModule.register([
  {
    name: 'NOTIFICATION_SERVICE_CLIENT', // ← ADD THIS
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'notification_queue',
      queueOptions: {
        durable: false,
      },
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
    },
  },
]);

const PharmacyServiceClient = ClientsModule.register([
  {
    name: 'PHARMACY_SERVICE_CLIENT',
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'pharmacy_queue',
      queueOptions: {
        durable: false,
      },
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
    },
  },
]);

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Import the client modules
    AuthServiceClient,
    DoctorServiceClient,
    NotificationServiceClient,
    PharmacyServiceClient,
  ],
  controllers: [
    AuthController,
    DoctorController,
    NotificationController,
    AssistantController,
    PharmacyController,
  ],
  providers: [AuthMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply auth middleware to specific protected routes
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        // Auth routes that need protection
        { path: 'auth/profile', method: RequestMethod.GET },
        { path: 'auth/profile', method: RequestMethod.PUT },
        // Doctor routes that need protection
        { path: 'doctors/workplaces', method: RequestMethod.GET },
        { path: 'doctors/workplaces', method: RequestMethod.POST },
        { path: 'doctors/workplaces/:workplaceId', method: RequestMethod.PUT },
        { path: 'doctors/workplaces/:workplaceId', method: RequestMethod.DELETE },
        { path: 'doctors/workplaces/:workplaceId/assistants', method: RequestMethod.GET },
        { path: 'doctors/workplaces/:workplaceId/assistants', method: RequestMethod.POST },
        { path: 'doctors/workplaces/:workplaceId/assistants/:assistantId', method: RequestMethod.DELETE },
        { path: 'doctors/workplaces/:workplaceId/appointment-slots', method: RequestMethod.GET },
        { path: 'doctors/workplaces/:workplaceId/appointment-slots', method: RequestMethod.POST },
        { path: 'doctors/appointments', method: RequestMethod.GET },
        { path: 'doctors/appointments/me', method: RequestMethod.GET },
        { path: 'doctors/analytics/monthly', method: RequestMethod.GET },
        { path: 'doctors/appointments/statistics', method: RequestMethod.GET },
        { path: 'doctors/profile/me', method: RequestMethod.GET },
        { path: 'doctors/profile/me', method: RequestMethod.PUT },
        // Notification routes that need protection
        { path: 'notifications', method: RequestMethod.GET },
        { path: 'notifications', method: RequestMethod.POST },
        // Assistant routes that need protection
        { path: 'assistants', method: RequestMethod.GET },
        { path: 'assistants', method: RequestMethod.POST },
        { path: 'assistants/doctor/my-assistants', method: RequestMethod.GET },
        { path: 'assistants/doctor/pending-invites', method: RequestMethod.GET },
        { path: 'assistants/doctor/invite', method: RequestMethod.POST },
        { path: 'assistants/doctor/invites/:inviteId', method: RequestMethod.DELETE },
        { path: 'assistants/doctor/remove-assistant', method: RequestMethod.DELETE },
        // Pharmacy routes that need protection
        { path: 'pharmacy/orders', method: RequestMethod.GET },
        { path: 'pharmacy/orders', method: RequestMethod.POST },
        { path: 'pharmacy/profile', method: RequestMethod.GET },
        { path: 'pharmacy/profile', method: RequestMethod.PUT },
        { path: 'pharmacy/dashboard/stats', method: RequestMethod.GET },
        { path: 'pharmacy/dashboard/top-products', method: RequestMethod.GET },
        { path: 'pharmacy/dashboard/recent-activity', method: RequestMethod.GET },
      );
  }
}
