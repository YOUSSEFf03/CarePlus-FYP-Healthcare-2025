import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';

// Import entities
import { User } from './user.entity';
import { Patient } from './patient.entity';
import { Doctor } from './doctor.entity';
import { Pharmacy } from './pharmacy.entity';
import { Assistant } from './assistant.entity';
import { Address } from './address.entity';

// Import services
import { UsersService } from './users.service';
import { AppService } from './app.service';
import { AppController } from './app.controller';

// Import guards and middleware
import { MicroserviceAuthGuard } from './guards/microservice-auth.guard';
import { RoleGuard } from './guards/role.guard';
import { AuthMiddleware } from './middleware/auth.middleware';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database configuration
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Patient, Doctor, Pharmacy, Assistant, Address],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      autoLoadEntities: true,
    }),

    // JWT configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '15m',
        },
      }),
      inject: [ConfigService],
    }),

    // Register repositories for entities
    TypeOrmModule.forFeature([User, Patient, Doctor, Pharmacy, Assistant, Address]),

    // RabbitMQ clients
    ClientsModule.register([
      {
        name: 'DOCTOR_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'doctor_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'NOTIFICATION_SERVICE',
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
  controllers: [AppController],
  providers: [
    AppService,
    UsersService,

    MicroserviceAuthGuard,
    RoleGuard,
    AuthMiddleware,
  ],
})
export class AppModule {}
