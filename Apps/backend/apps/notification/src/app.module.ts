// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import controllers
import { AppController } from './app.controller';

// Import services
import { AppService } from './app.service';
import { EmailService } from './services/email.service';
import { WhatsappService } from './services/whatsapp.service';
import { TemplateService } from './services/template.service';

// Import entities
import { NotificationLog } from './entities/notification-log.entity';
import { NotificationTemplate } from './entities/notification-template.entity';
import { UserPreference } from './entities/user-preference.entity';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database configuration
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.NOTIFICATION_DB_NAME || 'notification_service',
      entities: [NotificationLog, NotificationTemplate, UserPreference],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      autoLoadEntities: true,
    }),

    // Register repositories
    TypeOrmModule.forFeature([
      NotificationLog,
      NotificationTemplate,
      UserPreference,
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, EmailService, WhatsappService, TemplateService],
})
export class AppModule {}
