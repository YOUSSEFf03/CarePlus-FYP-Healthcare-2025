// doctor.module.ts - FIXED VERSION
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { Doctor } from './doctor.entity';
import { Appointment } from './appointment.entity';
import { DoctorReview } from './doctor-review.entity';
import { DoctorAnalytics } from './doctor-analytics.entity';

// Import auth guards
import { MicroserviceAuthGuard } from './guards/microservice-auth.guard';
import { RoleGuard } from './guards/role.guard';
import { DoctorOwnershipGuard } from './guards/doctor-ownership.guard';

import { AssistantInvite } from './assistant-invite.entity';
import { DoctorWorkplace } from './doctor-workplace.entity';
import { DoctorWorkplaceAssistant } from './doctor-workplace-assistant.entity';
import { Address } from './address.entity';
import { AppointmentSlot } from './appointment-slot.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Database configuration
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'doctor_service',
      entities: [
        Doctor,
        Appointment,
        DoctorReview,
        DoctorAnalytics,
        DoctorWorkplace,
        DoctorWorkplaceAssistant,
        Address,
        AppointmentSlot,
        AssistantInvite,
      ],
      synchronize: true, // Set to false in production
      logging: process.env.NODE_ENV === 'development',
    }),

    TypeOrmModule.forFeature([
      Doctor,
      Appointment,
      DoctorReview,
      DoctorWorkplaceAssistant,
      DoctorWorkplace,
      Address,
      AppointmentSlot,
      AssistantInvite,
      DoctorAnalytics,
    ]),

    // RabbitMQ clients
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE', // ← FIXED: Add auth service client
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'auth_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'NOTIFICATION_SERVICE', // ← FIXED: Add notification service client
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'notification_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [DoctorController],
  providers: [
    DoctorService,
    MicroserviceAuthGuard,
    RoleGuard,
    DoctorOwnershipGuard,
  ],
})
export class DoctorModule {}
