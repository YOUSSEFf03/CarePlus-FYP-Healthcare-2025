import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { DoctorController } from './doctor.controller';
import { AuthMiddleware } from './middleware/auth.middleware';
import { NotificationController } from './notification.controller';
import { RequestMethod } from '@nestjs/common';

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
  ],
  controllers: [AuthController, DoctorController, NotificationController],
  providers: [AuthMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        // Exclude public routes from auth middleware
        'auth/login',
        'auth/register',
        'auth/refresh-token',
        'auth/verify-otp',
        'auth/resend-otp',
        'auth/forgot-password',
        'auth/reset-password',
        'doctors',
        'doctors/(.*)/reviews',
        'doctors/(.*)/available-slots',
        'doctors/(.*)/stats',
        { path: 'doctors/:id', method: RequestMethod.GET },
      )
      .forRoutes(
        // Apply auth middleware to these controllers
        AuthController,
        DoctorController,
        NotificationController, // ← ADD THIS
      );
  }
}
