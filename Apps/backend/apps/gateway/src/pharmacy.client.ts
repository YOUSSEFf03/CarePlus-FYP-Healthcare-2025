import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';

export const PharmacyServiceClient: ClientProxy = ClientProxyFactory.create({
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
    queue: 'pharmacy_queue',
    queueOptions: {
      durable: false,
    },
  },
});


