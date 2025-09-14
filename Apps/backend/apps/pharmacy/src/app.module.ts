import { Module } from '@nestjs/common';
import { PharmacyModule } from './pharmacy.module';

@Module({
  imports: [PharmacyModule],
})
export class AppModule {}
