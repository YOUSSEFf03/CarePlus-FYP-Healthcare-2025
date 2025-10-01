# WhatsApp OTP Setup Guide

## 🔧 Configuration

Your WhatsApp OTP service is now configured with the following credentials:

### UltraMsg API Credentials:

- **Instance ID**: `instance121402`
- **Token**: `wahyyiw8jz96mkyi`
- **WhatsApp Number**: `+96171247781`

## 📋 Environment Variables

Create a `.env` file in `Apps/backend/apps/notification/` with:

```env
# UltraMsg WhatsApp API Configuration
ULTRA_INSTANCE_ID=instance121402
ULTRA_TOKEN=wahyyiw8jz96mkyi

# Email Configuration (for fallback)
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

## 🚀 How to Start

1. **Install Dependencies:**

   ```bash
   cd Apps/backend/apps/notification
   npm install
   ```

2. **Start the Service:**

   ```bash
   npm run start:dev
   ```

3. **Verify Connection:**
   - Check console logs for "✅ WhatsApp message sent" messages
   - Service will be available on port 3001

## 📱 Testing WhatsApp OTP

### Send Test OTP:

```bash
curl -X POST http://localhost:3001/notification/send-whatsapp-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "phone": "+96171247781",
    "otp": "123456",
    "userName": "Test User"
  }'
```

### Message Format:

- **Simple**: `"Your OTP is: 123456"`
- **With Name**: `"Hello John, your OTP is: 123456"`

## 🔄 Integration with Other Services

### From Auth Service:

```typescript
// Send WhatsApp OTP
await this.notificationClient.send(
  { cmd: 'send_whatsapp_otp' },
  {
    userId: 'user123',
    phone: '+96171247781',
    otp: '123456',
    userName: 'John Doe',
  },
);
```

### From Gateway:

```typescript
// REST API endpoint
POST /notification/send-whatsapp-otp
{
  "userId": "user123",
  "phone": "+96171247781",
  "otp": "123456",
  "userName": "John Doe"
}
```

## 🛠️ Troubleshooting

### Common Issues:

1. **"WhatsApp sending failed"**
   - Check UltraMsg dashboard for account status
   - Verify instance ID and token
   - Ensure WhatsApp number is verified

2. **"Phone number invalid"**
   - Use format: `+96171247781` (with country code)
   - Remove spaces and special characters

3. **"API rate limit exceeded"**
   - Wait a few minutes before retrying
   - Check UltraMsg account limits

### Debug Logs:

```bash
# Check notification logs
tail -f logs/notification.log

# Check service health
curl http://localhost:3001/health
```

## 📊 Monitoring

### Database Logs:

All OTP attempts are logged in the `notification_logs` table:

- **Status**: PENDING → SENT → DELIVERED/FAILED
- **Retry Count**: Automatic retry on failure
- **Error Messages**: Detailed error logging

### Health Check:

```bash
GET /health
```

## 🔐 Security Notes

- **OTP Expiration**: Configure in your auth service
- **Rate Limiting**: Built-in protection against spam
- **Phone Validation**: Automatic format validation
- **User Tracking**: Links OTP to specific user ID

## 📞 Support

- **UltraMsg Dashboard**: Check message delivery status
- **Service Logs**: Monitor for errors and retries
- **Database Logs**: Track all notification attempts

Your WhatsApp OTP service is now ready to use! 🎉
