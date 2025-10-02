import { Controller, Get } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';

@Controller('health')
export class HealthController {
  constructor(
    @Inject('AUTH_SERVICE_CLIENT')
    private readonly authServiceClient: ClientProxy,
    @Inject('DOCTOR_SERVICE_CLIENT')
    private readonly doctorServiceClient: ClientProxy,
    @Inject('PHARMACY_SERVICE_CLIENT')
    private readonly pharmacyServiceClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE_CLIENT')
    private readonly notificationServiceClient: ClientProxy,
  ) {}

  @Get()
  async getHealth() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        gateway: 'healthy',
        auth: 'unknown',
        doctor: 'unknown',
        pharmacy: 'unknown',
        notification: 'unknown',
      },
    };

    // Check auth service
    try {
      await lastValueFrom(
        this.authServiceClient
          .send({ cmd: 'health_check' }, {})
          .pipe(timeout(5000)),
      );
      health.services.auth = 'healthy';
    } catch (error) {
      health.services.auth = 'unhealthy';
    }

    // Check doctor service
    try {
      await lastValueFrom(
        this.doctorServiceClient
          .send({ cmd: 'health_check' }, {})
          .pipe(timeout(5000)),
      );
      health.services.doctor = 'healthy';
    } catch (error) {
      health.services.doctor = 'unhealthy';
    }

    // Check pharmacy service
    try {
      await lastValueFrom(
        this.pharmacyServiceClient
          .send({ cmd: 'health_check' }, {})
          .pipe(timeout(5000)),
      );
      health.services.pharmacy = 'healthy';
    } catch (error) {
      health.services.pharmacy = 'unhealthy';
    }

    // Check notification service
    try {
      await lastValueFrom(
        this.notificationServiceClient
          .send({ cmd: 'health_check' }, {})
          .pipe(timeout(5000)),
      );
      health.services.notification = 'healthy';
    } catch (error) {
      health.services.notification = 'unhealthy';
    }

    // Overall status
    const unhealthyServices = Object.values(health.services).filter(
      (status) => status === 'unhealthy',
    );

    if (unhealthyServices.length > 0) {
      health.status = 'degraded';
    }

    return health;
  }

  @Get('ready')
  async getReadiness() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  async getLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}
