import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { runSeeds } from './seeds';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: 'pharmacy_queue',
        queueOptions: {
          durable: false,
        },
      },
    },
  );

  // Run database seeds if needed
  if (process.env.RUN_SEEDS === 'true') {
    try {
      const dataSource = app.get(DataSource);
      await runSeeds(dataSource);
    } catch (error) {
      console.error('Error running seeds:', error);
    }
  }

  await app.listen();
  console.log('Pharmacy microservice is listening on pharmacy_queue');
}

bootstrap();
