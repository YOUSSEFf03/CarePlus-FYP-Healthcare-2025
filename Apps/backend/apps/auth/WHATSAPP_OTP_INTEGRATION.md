# WhatsApp OTP Integration Guide

## 🎯 Overview

The auth service is now fully integrated with WhatsApp OTP functionality. When users register, they will automatically receive an OTP via WhatsApp to their phone number.

## 🔧 Configuration

### 1. Environment Variables

Create/update your `.env` file in `Apps/backend/apps/auth/`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_DATABASE=auth_db

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# Application Configuration
PORT=3001
NODE_ENV=development
```

### 2. WhatsApp Service Configuration

The notification service is already configured with your UltraMsg credentials:

- **Instance ID**: `instance121402`
- **Token**: `wahyyiw8jz96mkyi`
- **WhatsApp Number**: `+96171247781`

## 🚀 How It Works

### Registration Flow:

1. **User Registers** → Auth service creates user account
2. **OTP Generated** → 6-digit random OTP created
3. **WhatsApp OTP Sent** → OTP sent to user's phone via WhatsApp
4. **User Verifies** → User enters OTP to verify account
5. **Account Activated** → User can now login

### Code Flow:

```typescript
// 1. User registration
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+96171247781",
  "role": "patient"
}

// 2. OTP automatically sent to WhatsApp
// Message: "Your OTP is: 123456"

// 3. User verifies OTP
POST /auth/verify-otp
{
  "email": "john@example.com",
  "otp": "123456"
}

// 4. Account verified, user can login
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

### 3. Check WhatsApp

You should receive a WhatsApp message like:

```
Your OTP is: 123456
```

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

### Registration

```typescript
POST /auth/register
{
  "name": string,
  "email": string,
  "password": string,
  "phone": string,        // ← WhatsApp OTP sent to this number
  "role": "patient" | "doctor" | "pharmacy" | "assistant" | "admin"
}
```

### OTP Verification

```typescript
POST /auth/verify-otp
{
  "email": string,
  "otp": string
}
```

### Resend OTP

```typescript
POST /auth/resend-otp
{
  "email": string
}
```

### Phone OTP (Alternative)

```typescript
POST /auth/send-phone-otp
{
  "phone": string
}

POST /auth/verify-phone-otp
{
  "phone": string,
  "otp": string
}
```

## 🛠️ Troubleshooting

### Common Issues:

1. **"WhatsApp OTP not received"**
   - Check UltraMsg dashboard for message status
   - Verify phone number format: `+96171247781`
   - Check notification service logs

2. **"Notification service connection failed"**
   - Ensure RabbitMQ is running
   - Check notification service is started
   - Verify queue configuration

3. **"OTP expired"**
   - OTP expires in 10 minutes
   - Use resend OTP endpoint
   - Check system time synchronization

### Debug Logs:

```bash
# Check auth service logs
tail -f Apps/backend/apps/auth/logs/auth.log

# Check notification service logs
tail -f Apps/backend/apps/notification/logs/notification.log

# Check RabbitMQ status
rabbitmqctl status
```

## 📊 Monitoring

### Database Tracking:

- **Users Table**: `otp_code`, `otp_expiry`, `is_verified`
- **Notification Logs**: All OTP attempts logged
- **Status Tracking**: PENDING → SENT → DELIVERED/FAILED

### Health Checks:

```bash
# Auth service health
curl http://localhost:3001/health

# Notification service health
curl http://localhost:3002/health
```

## 🔐 Security Features

- **OTP Expiration**: 10 minutes
- **Rate Limiting**: Prevents spam
- **Phone Validation**: Validates phone number format
- **User Tracking**: Links OTP to specific user ID
- **Secure Storage**: OTP hashed in database

## 📞 Support

- **UltraMsg Dashboard**: Check message delivery status
- **Service Logs**: Monitor for errors and retries
- **Database Logs**: Track all OTP attempts

## 🎉 Success!

Your WhatsApp OTP integration is now complete! Users will receive OTP messages on their WhatsApp when they register. The system automatically handles:

- ✅ OTP generation
- ✅ WhatsApp message sending
- ✅ OTP verification
- ✅ Account activation
- ✅ Error handling and retries

Test it out by registering a new user with a phone number! 🚀
