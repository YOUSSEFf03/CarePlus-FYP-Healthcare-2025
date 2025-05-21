import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Patient } from './patient.entity';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Doctor } from './doctor.entity';
import { Pharmacy } from './pharmacy.entity';
import { WhatsappModule } from './whatsapp/whatsapp.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WhatsappModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Patient, Doctor, Pharmacy],
      synchronize: true,
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: cfg.get<string>('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),

    TypeOrmModule.forFeature([User, Patient, Doctor, Pharmacy]),
  ],
  providers: [UsersService, EmailService, AppService],
  controllers: [AppController],
})
export class AppModule {}
