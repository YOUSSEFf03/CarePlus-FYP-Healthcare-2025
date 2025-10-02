# Email & WhatsApp OTP Setup Guide

## 🎯 Overview

Your notification service is now fully configured to send OTP messages via both **Email** and **WhatsApp** during user registration.

## 🔧 Configuration

### Email Service (Gmail)

- **Email**: `fyphealthcare2025@gmail.com`
- **Password**: `DTYfyp8$`
- **Service**: Gmail SMTP

### WhatsApp Service (UltraMsg)

- **Instance ID**: `instance121402`
- **Token**: `wahyyiw8jz96mkyi`
- **WhatsApp Number**: `+96171247781`

## 📋 Environment Variables

Create a `.env` file in `Apps/backend/apps/notification/` with:

```env
# UltraMsg WhatsApp API Configuration
ULTRA_INSTANCE_ID=instance121402
ULTRA_TOKEN=wahyyiw8jz96mkyi

# Email Configuration (Gmail)
EMAIL_USER=fyphealthcare2025@gmail.com
EMAIL_PASS=zyfc akaa yfkr wmlv

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_DATABASE=notification_db

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672

# Application Configuration
PORT=3001
NODE_ENV=development
```

## 🚀 How It Works

### Registration Flow:

1. **User Registers** → Auth service creates user account
2. **Dual OTP Sent** → OTP sent via both Email AND WhatsApp
3. **User Receives** →
   - Email: `"Your verification code is: 123456"`
   - WhatsApp: `"Your OTP is: 123456"`
4. **User Verifies** → User enters OTP to verify account
5. **Account Activated** → User can now login

### Message Formats:

#### Email OTP:

```html
Subject: Verify your email Content:
<p>Your verification code is: <strong>123456</strong></p>
```

#### WhatsApp OTP:

```
Your OTP is: 123456
```

## 📱 Testing the Integration

### 1. Start Services

```bash
# Terminal 1: Start RabbitMQ
# (Make sure RabbitMQ is running)

# Terminal 2: Start Notification Service
cd Apps/backend/apps/notification
npm run start:dev

# Terminal 3: Start Auth Service
cd Apps/backend/apps/auth
npm run start:dev
```

### 2. Test Registration

```bash
# Register a new user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+96171247781",
    "role": "patient"
  }'
```

### 3. Check Both Channels

You should receive OTP on:

- **Email**: `test@example.com` (if valid email)
- **WhatsApp**: `+96171247781`

### 4. Verify OTP

```bash
# Verify the OTP
curl -X POST http://localhost:3001/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

## 🔄 API Endpoints

### Send Email OTP

```typescript
// Message Pattern: 'send_email_otp'
{
  userId: string,
  email: string,
  otp: string,
  userName?: string
}
```

### Send WhatsApp OTP

```typescript
// Message Pattern: 'send_whatsapp_otp'
{
  userId: string,
  phone: string,
  otp: string,
  userName?: string
}
```

### Send Both (Registration)

```typescript
// Message Pattern: 'send_otp'
{
  userId: string,
  type: 'EMAIL' | 'WHATSAPP',
  recipient: string,
  otp: string,
  userName?: string
}
```

## 🛠️ Troubleshooting

### Email Issues:

1. **"Email sending failed"**
   - Check Gmail credentials
   - Verify 2FA is disabled or use App Password
   - Check Gmail SMTP settings

2. **"Authentication failed"**
   - Ensure password is correct: `DTYfyp8$`
   - Check if Gmail account is active
   - Verify less secure app access (if needed)

### WhatsApp Issues:

1. **"WhatsApp OTP not received"**
   - Check UltraMsg dashboard
   - Verify phone number format: `+96171247781`
   - Check notification service logs

2. **"API rate limit exceeded"**
   - Wait a few minutes before retrying
   - Check UltraMsg account limits

### General Issues:

1. **"Notification service connection failed"**
   - Ensure RabbitMQ is running
   - Check notification service is started
   - Verify queue configuration

## 📊 Monitoring

### Database Tracking:

- **Notification Logs**: All OTP attempts logged
- **Status Tracking**: PENDING → SENT → DELIVERED/FAILED
- **Retry Count**: Automatic retry on failure
- **Error Messages**: Detailed error logging

### Health Check:

```bash
# Check notification service health
curl http://localhost:3001/health
```

### Debug Logs:

```bash
# Check notification service logs
tail -f Apps/backend/apps/notification/logs/notification.log

# Check auth service logs
tail -f Apps/backend/apps/auth/logs/auth.log
```

## 🔐 Security Features

- **OTP Expiration**: 10 minutes
- **Rate Limiting**: Prevents spam
- **Dual Channel**: Email + WhatsApp for redundancy
- **Secure Storage**: OTP hashed in database
- **User Tracking**: Links OTP to specific user ID

## 📞 Support

### Gmail Configuration:

- **SMTP Server**: smtp.gmail.com
- **Port**: 587 (TLS) or 465 (SSL)
- **Authentication**: Required

### UltraMsg Configuration:

- **Dashboard**: Check message delivery status
- **API Docs**: UltraMsg API documentation
- **Support**: UltraMsg support team

## 🎉 Success!

Your dual-channel OTP system is now complete! Users will receive OTP messages on both their **email** and **WhatsApp** when they register. The system automatically handles:

- ✅ Email OTP via Gmail
- ✅ WhatsApp OTP via UltraMsg
- ✅ Dual-channel delivery
- ✅ Error handling and retries
- ✅ Fallback mechanisms
- ✅ Comprehensive logging

Test it out by registering a new user! 🚀

## 📝 Notes

- **Gmail Security**: If you encounter authentication issues, you may need to enable "Less secure app access" or use an App Password
- **WhatsApp Delivery**: UltraMsg handles WhatsApp delivery, check their dashboard for delivery status
- **Rate Limits**: Both Gmail and UltraMsg have rate limits, monitor usage accordingly
- **Logs**: All attempts are logged in the database for monitoring and debugging
