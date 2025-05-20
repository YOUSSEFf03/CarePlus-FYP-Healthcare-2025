"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServiceClient = void 0;
const microservices_1 = require("@nestjs/microservices");
exports.AuthServiceClient = microservices_1.ClientProxyFactory.create({
    transport: microservices_1.Transport.RMQ,
    options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'auth_queue',
        queueOptions: {
            durable: false,
        },
    },
});
//# sourceMappingURL=auth.client.js.map