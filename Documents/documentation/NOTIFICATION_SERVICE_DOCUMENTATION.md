# Notification Service Documentation

## FYP Healthcare 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup & Configuration](#setup--configuration)
4. [API Reference](#api-reference)
5. [Database Schema](#database-schema)
6. [Message Patterns](#message-patterns)
7. [Services](#services)
8. [Templates](#templates)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)
11. [Security](#security)

---

## 🎯 Overview

The Notification Service is a microservice built with NestJS that handles all communication channels for the FYP Healthcare 2025 system. It provides email, WhatsApp, SMS, and push notification capabilities with template management, user preferences, and comprehensive logging.

### Key Features

- ✅ **Multi-channel Notifications**: Email, WhatsApp, SMS, Push
- ✅ **Template Management**: Dynamic email/WhatsApp templates
- ✅ **User Preferences**: Customizable notification settings
- ✅ **Comprehensive Logging**: Full audit trail of all notifications
- ✅ **Retry Mechanism**: Automatic retry on failures
- ✅ **Status Tracking**: Real-time delivery status
- ✅ **Microservice Architecture**: RabbitMQ-based communication

### Supported Channels

| Channel  | Status     | Provider     | Features                    |
| -------- | ---------- | ------------ | --------------------------- |
| Email    | ✅ Active  | Gmail SMTP   | HTML templates, attachments |
| WhatsApp | ✅ Active  | UltraMsg API | Text messages, media        |
| SMS      | 🔄 Planned | TBD          | Text messages               |
| Push     | 🔄 Planned | FCM          | Mobile notifications        |

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Service  │    │  Doctor Service │    │ Gateway Service │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      RabbitMQ Queue       │
                    │   (notification_queue)    │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │   Notification Service    │
                    │                          │
                    │  ┌─────────────────────┐ │
                    │  │   Email Service     │ │
                    │  └─────────────────────┘ │
                    │  ┌─────────────────────┐ │
                    │  │  WhatsApp Service   │ │
                    │  └─────────────────────┘ │
                    │  ┌─────────────────────┐ │
                    │  │  Template Service   │ │
                    │  └─────────────────────┘ │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │    PostgreSQL Database   │
                    │                          │
                    │  • notification_logs     │
                    │  • notification_templates│
                    │  • user_preferences      │
                    └──────────────────────────┘
```

### Technology Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with TypeORM
- **Message Queue**: RabbitMQ
- **Email**: Gmail SMTP
- **WhatsApp**: UltraMsg API
- **Language**: TypeScript

---

## ⚙️ Setup & Configuration

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- RabbitMQ 3.8+
- Gmail account with App Password
- UltraMsg account

### Installation

```bash
# Navigate to notification service
cd Apps/backend/apps/notification

# Install dependencies
npm install

# Build the service
npm run build
```

### Environment Configuration

Create a `.env` file in `Apps/backend/apps/notification/`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
NOTIFICATION_DB_NAME=notification_db

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672

# Email Configuration (Gmail)
EMAIL_USER=fyphealthcare2025@gmail.com
EMAIL_PASS=your_app_password

# WhatsApp Configuration (UltraMsg)
ULTRA_INSTANCE_ID=instance121402
ULTRA_TOKEN=your_ultra_token

# Application Configuration
PORT=3001
NODE_ENV=development
```

### Database Setup

```sql
-- Create database
CREATE DATABASE notification_db;

-- The service will automatically create tables using TypeORM
```

### Running the Service

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

---

## 📚 API Reference

### Message Patterns

The notification service uses RabbitMQ message patterns for communication. All endpoints are accessed via message patterns, not direct HTTP calls.

#### Core Notification Patterns

##### Send Notification

```typescript
// Pattern: 'send_notification'
{
  userId: string;
  type: 'email' | 'whatsapp' | 'sms' | 'push';
  recipient: string; // email or phone
  subject: string;
  content: string;
  templateId?: string;
  templateData?: any;
}
```

##### Send OTP

```typescript
// Pattern: 'send_otp'
{
  userId: string;
  type: 'email' | 'whatsapp';
  recipient: string;
  otp: string;
  userName?: string;
}
```

##### Send Template Notification

```typescript
// Pattern: 'send_template_notification'
{
  userId: string;
  templateName: string;
  type: 'email' | 'whatsapp' | 'sms' | 'push';
  recipient: string;
  templateData: any;
}
```

#### Specific Notification Types

##### Email OTP

```typescript
// Pattern: 'send_email_otp'
{
  userId: string;
  email: string;
  otp: string;
  userName?: string;
}
```

##### WhatsApp OTP

```typescript
// Pattern: 'send_whatsapp_otp'
{
  userId: string;
  phone: string;
  otp: string;
  userName?: string;
}
```

##### Password Reset Email

```typescript
// Pattern: 'send_password_reset_email'
{
  userId: string;
  email: string;
  otp: string;
  userName?: string;
}
```

##### Appointment Reminder

```typescript
// Pattern: 'send_appointment_reminder'
{
  userId: string;
  type: 'email' | 'whatsapp';
  recipient: string;
  appointmentDate: string;
  appointmentTime: string;
  doctorName: string;
  patientName: string;
}
```

##### Doctor Verification Email

```typescript
// Pattern: 'send_doctor_verification_email'
{
  userId: string;
  email: string;
  doctorName: string;
  status: 'approved' | 'rejected';
  rejectionReason?: string;
}
```

#### User Preferences

##### Get User Preferences

```typescript
// Pattern: 'get_user_preferences'
{
  userId: string;
}
```

##### Update User Preferences

```typescript
// Pattern: 'update_user_preferences'
{
  userId: string;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  emailFrequency: 'immediate' | 'daily' | 'weekly';
  whatsappFrequency: 'immediate' | 'daily' | 'weekly';
}
```

#### Notification History

##### Get Notification History

```typescript
// Pattern: 'get_notification_history'
{
  userId: string;
  limit?: number; // default: 50
}
```

##### Get Notification Status

```typescript
// Pattern: 'get_notification_status'
{
  logId: string;
}
```

#### Template Management

##### Create Template

```typescript
// Pattern: 'create_template'
{
  name: string;
  type: 'email' | 'whatsapp' | 'sms' | 'push';
  subject: string;
  content: string;
  defaultData?: any;
}
```

##### Get All Templates

```typescript
// Pattern: 'get_all_templates'
// No payload required
```

##### Get Template

```typescript
// Pattern: 'get_template'
{
  name: string;
  type: 'email' | 'whatsapp' | 'sms' | 'push';
}
```

##### Update Template

```typescript
// Pattern: 'update_template'
{
  id: string;
  updates: {
    subject?: string;
    content?: string;
    defaultData?: any;
    isActive?: boolean;
  };
}
```

---

## 🗄️ Database Schema

### Notification Logs

```typescript
@Entity('notification_logs')
class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType; // 'email' | 'whatsapp' | 'sms' | 'push'

  @Column()
  recipient: string; // email or phone number

  @Column()
  subject: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus; // 'pending' | 'sent' | 'delivered' | 'failed' | 'retry'

  @Column({ nullable: true })
  templateId: string;

  @Column('json', { nullable: true })
  templateData: any;

  @Column({ nullable: true })
  externalId: string; // ID from external service

  @Column('text', { nullable: true })
  errorMessage: string;

  @Column({ default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Notification Templates

```typescript
@Entity('notification_templates')
class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., 'otp_email', 'appointment_reminder'

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  subject: string;

  @Column('text')
  content: string; // Template with placeholders like {{otp}}, {{name}}

  @Column('json', { nullable: true })
  defaultData: any; // Default values for template variables

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### User Preferences

```typescript
@Entity('user_preferences')
class UserPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column({ default: true })
  emailEnabled: boolean;

  @Column({ default: true })
  whatsappEnabled: boolean;

  @Column({ default: false })
  smsEnabled: boolean;

  @Column({ default: true })
  pushEnabled: boolean;

  @Column({
    type: 'enum',
    enum: ['immediate', 'daily', 'weekly'],
    default: 'immediate',
  })
  emailFrequency: string;

  @Column({
    type: 'enum',
    enum: ['immediate', 'daily', 'weekly'],
    default: 'immediate',
  })
  whatsappFrequency: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 🔄 Message Patterns

### Communication Flow

1. **Service A** sends message to RabbitMQ queue
2. **Notification Service** receives message via message pattern
3. **Service processes** the notification request
4. **External service** (Gmail/UltraMsg) sends notification
5. **Database** logs the notification attempt
6. **Response** sent back to requesting service

### Message Pattern Examples

#### From Auth Service (User Registration)

```typescript
// Send OTP via both email and WhatsApp
await this.notificationClient.send('send_otp', {
  userId: user.id,
  type: 'email',
  recipient: user.email,
  otp: generatedOTP,
  userName: user.name,
});

await this.notificationClient.send('send_otp', {
  userId: user.id,
  type: 'whatsapp',
  recipient: user.phone,
  otp: generatedOTP,
  userName: user.name,
});
```

#### From Doctor Service (Appointment Reminder)

```typescript
// Send appointment reminder
await this.notificationClient.send('send_appointment_reminder', {
  userId: patient.id,
  type: 'email',
  recipient: patient.email,
  appointmentDate: '2024-01-15',
  appointmentTime: '10:00 AM',
  doctorName: 'Dr. Smith',
  patientName: patient.name,
});
```

---

## 🛠️ Services

### Email Service

**File**: `src/services/email.service.ts`

Handles all email-related functionality using Gmail SMTP.

#### Features

- HTML email support
- Template rendering
- Attachment support (planned)
- Delivery tracking

#### Configuration

```typescript
// Gmail SMTP Configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password
  },
});
```

### WhatsApp Service

**File**: `src/services/whatsapp.service.ts`

Handles WhatsApp messaging via UltraMsg API.

#### Features

- Text message sending
- Media support (planned)
- Delivery status tracking
- Rate limit handling

#### Configuration

```typescript
// UltraMsg API Configuration
const ultraConfig = {
  instanceId: process.env.ULTRA_INSTANCE_ID,
  token: process.env.ULTRA_TOKEN,
  baseUrl: 'https://api.ultramsg.com',
};
```

### Template Service

**File**: `src/services/template.service.ts`

Manages notification templates and dynamic content rendering.

#### Features

- Template CRUD operations
- Variable substitution
- Template validation
- Version control (planned)

#### Template Variables

```typescript
// Example template with variables
const template = {
  subject: 'Welcome {{userName}}!',
  content: `
    <h1>Hello {{userName}}</h1>
    <p>Your OTP is: <strong>{{otp}}</strong></p>
    <p>This code expires in {{expiryMinutes}} minutes.</p>
  `,
};
```

---

## 📝 Templates

### Built-in Templates

#### OTP Email Template

```html
Subject: Verify your email - FYP Healthcare 2025

<h2>Email Verification</h2>
<p>Hello {{userName}},</p>
<p>Your verification code is: <strong>{{otp}}</strong></p>
<p>This code will expire in 10 minutes.</p>
<p>If you didn't request this, please ignore this email.</p>
```

#### Appointment Reminder Template

```html
Subject: Appointment Reminder - {{doctorName}}

<h2>Appointment Reminder</h2>
<p>Hello {{patientName}},</p>
<p>This is a reminder for your appointment with {{doctorName}}.</p>
<p><strong>Date:</strong> {{appointmentDate}}</p>
<p><strong>Time:</strong> {{appointmentTime}}</p>
<p>Please arrive 15 minutes early.</p>
```

#### Doctor Verification Template

```html
Subject: Doctor Verification {{status}} - FYP Healthcare 2025

<h2>Verification {{status}}</h2>
<p>Hello {{doctorName}},</p>
<p>Your doctor verification has been {{status}}.</p>
{{#if rejectionReason}}
<p><strong>Reason:</strong> {{rejectionReason}}</p>
{{/if}}
<p>Thank you for using FYP Healthcare 2025.</p>
```

### Creating Custom Templates

```typescript
// Create a new template
await this.templateService.createTemplate({
  name: 'custom_welcome',
  type: 'email',
  subject: 'Welcome to {{clinicName}}',
  content: `
    <h1>Welcome {{userName}}!</h1>
    <p>Welcome to {{clinicName}}.</p>
    <p>Your account has been created successfully.</p>
  `,
  defaultData: {
    clinicName: 'FYP Healthcare 2025',
  },
});
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

### Integration Tests

```bash
# Run end-to-end tests
npm run test:e2e
```

### Manual Testing

#### Test Email Sending

```bash
# Send test email
curl -X POST http://localhost:3001/test/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "subject": "Test Email",
    "content": "This is a test email"
  }'
```

#### Test WhatsApp Sending

```bash
# Send test WhatsApp message
curl -X POST http://localhost:3001/test/send-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+96171247781",
    "message": "Test WhatsApp message"
  }'
```

### Test Scenarios

1. **OTP Flow**: Send OTP via email and WhatsApp
2. **Template Rendering**: Test template variable substitution
3. **Error Handling**: Test with invalid credentials
4. **Rate Limiting**: Test with multiple rapid requests
5. **Database Logging**: Verify all notifications are logged

---

## 🔧 Troubleshooting

### Common Issues

#### Email Not Sending

**Problem**: Email service fails to send emails

**Solutions**:

1. Check Gmail credentials in `.env`
2. Verify App Password is correct
3. Ensure 2FA is enabled and App Password is used
4. Check Gmail SMTP settings

```bash
# Check email service logs
tail -f logs/email.log

# Test SMTP connection
npm run test:email-connection
```

#### WhatsApp Not Sending

**Problem**: WhatsApp messages not delivered

**Solutions**:

1. Verify UltraMsg credentials
2. Check phone number format (+country code)
3. Ensure UltraMsg account is active
4. Check rate limits

```bash
# Check WhatsApp service logs
tail -f logs/whatsapp.log

# Test UltraMsg connection
npm run test:whatsapp-connection
```

#### RabbitMQ Connection Issues

**Problem**: Service can't connect to RabbitMQ

**Solutions**:

1. Ensure RabbitMQ is running
2. Check connection URL in `.env`
3. Verify queue permissions
4. Check network connectivity

```bash
# Check RabbitMQ status
sudo systemctl status rabbitmq-server

# Check queue status
sudo rabbitmqctl list_queues
```

#### Database Connection Issues

**Problem**: Can't connect to PostgreSQL

**Solutions**:

1. Verify database credentials
2. Ensure PostgreSQL is running
3. Check database exists
4. Verify network connectivity

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -h localhost -U postgres -d notification_db
```

### Debug Mode

```bash
# Run in debug mode
npm run start:debug

# Check logs
tail -f logs/notification.log
```

### Health Check

```bash
# Check service health
curl http://localhost:3001/health

# Check database connection
curl http://localhost:3001/health/db

# Check external services
curl http://localhost:3001/health/external
```

---

## 🔐 Security

### Authentication & Authorization

- **JWT Tokens**: All requests must include valid JWT tokens
- **Role-based Access**: Different permissions for different user types
- **API Rate Limiting**: Prevents abuse and spam

### Data Protection

- **Encryption**: Sensitive data encrypted in transit and at rest
- **PII Handling**: Personal information handled according to privacy policies
- **Audit Logging**: All actions logged for compliance

### External Service Security

#### Gmail Security

- **App Passwords**: Use App Passwords instead of regular passwords
- **2FA Required**: Two-factor authentication enabled
- **SMTP TLS**: All email communication encrypted

#### UltraMsg Security

- **API Tokens**: Secure token-based authentication
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **Webhook Verification**: Webhook signatures verified

### Best Practices

1. **Environment Variables**: Never commit credentials to code
2. **Regular Updates**: Keep dependencies updated
3. **Monitoring**: Monitor for suspicious activity
4. **Backup**: Regular database backups
5. **Logging**: Comprehensive audit logging

---

## 📊 Monitoring & Analytics

### Metrics Tracked

- **Delivery Rates**: Success/failure rates per channel
- **Response Times**: Average time to send notifications
- **Error Rates**: Frequency of different error types
- **User Engagement**: Notification open/click rates

### Logging

```typescript
// Log levels
console.log('INFO: Notification sent successfully');
console.warn('WARN: Rate limit approaching');
console.error('ERROR: Failed to send notification');
```

### Health Monitoring

```bash
# Service health endpoint
GET /health

# Database health
GET /health/db

# External services health
GET /health/external
```

---

## 🚀 Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] RabbitMQ configured
- [ ] External service credentials verified
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup strategy implemented

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

### Environment-Specific Configuration

```env
# Production
NODE_ENV=production
DB_HOST=prod-db-host
RABBITMQ_URL=amqp://prod-rabbitmq:5672

# Staging
NODE_ENV=staging
DB_HOST=staging-db-host
RABBITMQ_URL=amqp://staging-rabbitmq:5672
```

---

## 📞 Support

### Documentation Links

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [Gmail SMTP Setup](https://support.google.com/mail/answer/7126229)
- [UltraMsg API Documentation](https://ultramsg.com/api/)

### Contact Information

- **Development Team**: FYP Healthcare 2025 Team
- **Email**: fyphealthcare2025@gmail.com
- **Repository**: [GitHub Repository Link]

### Issue Reporting

When reporting issues, please include:

1. **Error Message**: Full error message and stack trace
2. **Environment**: Node.js version, OS, environment variables
3. **Steps to Reproduce**: Detailed steps to reproduce the issue
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happens
6. **Logs**: Relevant log entries

---

## 📝 Changelog

### Version 1.0.0 (Current)

- ✅ Initial release
- ✅ Email and WhatsApp support
- ✅ Template management
- ✅ User preferences
- ✅ Comprehensive logging
- ✅ RabbitMQ integration

### Planned Features

- 🔄 SMS support
- 🔄 Push notifications
- 🔄 Template versioning
- 🔄 Advanced analytics
- 🔄 Webhook support
- 🔄 Multi-language templates

---

_Last updated: January 2025_
_Version: 1.0.0_
