import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

// Controllers and Services
import { PharmacyController } from './pharmacy.controller';
import { PharmacyService } from './pharmacy.service';

// Entities
import { User } from './entities/user.entity';
import { Pharmacy } from './entities/pharmacy.entity';
import { PharmacyBranch } from './entities/pharmacy-branch.entity';
import { Address } from './entities/address.entity';
import { Category } from './entities/category.entity';
import { Item } from './entities/item.entity';
import { Medicine } from './entities/medicine.entity';
import { PharmacyBranchStock } from './entities/pharmacy-branch-stock.entity';
import { Reservation } from './entities/reservation.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Delivery } from './entities/delivery.entity';

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
      database: process.env.DB_NAME || 'pharmacy_service',
      entities: [
        User,
        Pharmacy,
        PharmacyBranch,
        Address,
        Category,
        Item,
        Medicine,
        PharmacyBranchStock,
        Reservation,
        Order,
        OrderItem,
        Delivery,
      ],
      synchronize: true, // Set to false in production
      logging: process.env.NODE_ENV === 'development',
    }),

    // Register entities for repository injection
    TypeOrmModule.forFeature([
      User,
      Pharmacy,
      PharmacyBranch,
      Address,
      Category,
      Item,
      Medicine,
      PharmacyBranchStock,
      Reservation,
      Order,
      OrderItem,
      Delivery,
    ]),

    // RabbitMQ clients for communication with other services
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
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
  controllers: [PharmacyController],
  providers: [PharmacyService],
})
export class PharmacyModule {}



