import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { DoctorController } from './doctor.controller';
import { AuthServiceClient } from './auth.client';
import { DoctorServiceClient } from './doctor.client';
@Module({
  imports: [],
  controllers: [AuthController],
  providers: [
    {
      provide: 'AUTH_SERVICE_CLIENT',
      useValue: AuthServiceClient,
    },
    {
      provide: 'DOCTOR_SERVICE_CLIENT',
      useValue: DoctorServiceClient,
    },
  ],
})
export class AppModule {}
