import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthServiceClient } from './auth.client';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [
    {
      provide: 'AUTH_SERVICE_CLIENT',
      useValue: AuthServiceClient,
    },
  ],
})
export class AppModule {}
