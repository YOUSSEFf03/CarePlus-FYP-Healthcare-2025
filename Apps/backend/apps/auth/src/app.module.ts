import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Patient } from './patient.entity';
import { UsersService } from './Users.Service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Patient],
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

    TypeOrmModule.forFeature([User, Patient]),
  ],
  providers: [UsersService, EmailService],
})
export class AppModule {}
