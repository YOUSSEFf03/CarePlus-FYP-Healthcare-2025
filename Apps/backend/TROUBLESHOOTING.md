# Healthcare FYP Backend - Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. Registration Not Working with `npm run start:backend`

**Problem**: When running all services together, registration fails or times out.

**Root Causes**:
- Services starting too quickly without proper delays
- Missing environment variables
- Database connection issues
- RabbitMQ connection problems

**Solutions**:

#### Option 1: Use the New Startup Script (Recommended)
```bash
# First, setup environment variables
npm run setup:env

# Then start all services with proper delays
npm run start:backend
```

#### Option 2: Start Services Individually
```bash
# Terminal 1
npm run start:auth

# Terminal 2 (wait 5 seconds)
npm run start:doctor

# Terminal 3 (wait 5 seconds)
npm run start:notification

# Terminal 4 (wait 5 seconds)
npm run start:pharmacy

# Terminal 5 (wait 5 seconds)
npm run start:gateway
```

#### Option 3: Use Alternative Startup Methods
```bash
# Parallel startup (faster but may have timing issues)
npm run start:backend:parallel

# Sequential startup (slower but more reliable)
npm run start:backend:sequential
```

### 2. Database Connection Issues

**Problem**: Services can't connect to PostgreSQL.

**Solutions**:
1. **Check PostgreSQL is running**:
   ```bash
   # Windows
   net start postgresql-x64-13
   
   # Linux/Mac
   sudo systemctl start postgresql
   ```

2. **Verify database credentials** in `.env` file:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   ```

3. **Create required databases**:
   ```sql
   CREATE DATABASE auth_service;
   CREATE DATABASE doctor_service;
   CREATE DATABASE notification_service;
   CREATE DATABASE pharmacy_service;
   ```

### 3. RabbitMQ Connection Issues

**Problem**: Services can't connect to RabbitMQ.

**Solutions**:
1. **Start RabbitMQ**:
   ```bash
   # Windows
   net start RabbitMQ
   
   # Linux/Mac
   sudo systemctl start rabbitmq-server
   ```

2. **Check RabbitMQ management**:
   - Open http://localhost:15672
   - Default credentials: guest/guest

3. **Verify RabbitMQ URL** in `.env`:
   ```
   RABBITMQ_URL=amqp://localhost:5672
   ```

### 4. Port Conflicts

**Problem**: Services can't start due to port conflicts.

**Solutions**:
1. **Check which ports are in use**:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Linux/Mac
   lsof -i :3000
   ```

2. **Kill conflicting processes**:
   ```bash
   # Windows
   taskkill /PID <process_id> /F
   
   # Linux/Mac
   kill -9 <process_id>
   ```

### 5. Environment Variable Issues

**Problem**: Services not reading environment variables correctly.

**Solutions**:
1. **Run setup script**:
   ```bash
   npm run setup:env
   ```

2. **Manually create .env file** in `Apps/backend/`:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   RABBITMQ_URL=amqp://localhost:5672
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=15m
   NODE_ENV=development
   ```

### 6. Service-Specific Issues

#### Auth Service Issues
- **Problem**: JWT token errors
- **Solution**: Check `JWT_SECRET` in environment variables

#### Doctor Service Issues
- **Problem**: Doctor profile creation fails
- **Solution**: Ensure doctor service is running and database is accessible

#### Gateway Service Issues
- **Problem**: Gateway not responding
- **Solution**: Check if port 3000 is available and gateway service started last

### 7. Testing the Fix

After fixing issues, test with:
```bash
# Test registration
node test-registration.js

# Check service status
curl http://localhost:3000/auth/login
```

### 8. Logs and Debugging

**Check service logs**:
- Each service outputs logs to the terminal
- Look for connection errors, database errors, or RabbitMQ errors
- Check for timeout errors in the gateway

**Common error patterns**:
- `ECONNREFUSED`: Service not running or wrong port
- `ETIMEDOUT`: Network or service timeout
- `Database connection failed`: PostgreSQL issues
- `RabbitMQ connection failed`: RabbitMQ issues

### 9. Quick Fix Checklist

1. ✅ PostgreSQL is running
2. ✅ RabbitMQ is running
3. ✅ Environment variables are set
4. ✅ Required databases exist
5. ✅ No port conflicts
6. ✅ Services start in correct order
7. ✅ All services are running
8. ✅ Registration test passes

### 10. Emergency Reset

If nothing works:
```bash
# Stop all services (Ctrl+C)
# Restart PostgreSQL and RabbitMQ
# Clear any cached data
# Run setup again
npm run setup:env
npm run start:backend
```

## 📞 Need Help?

If issues persist:
1. Check the service logs for specific error messages
2. Verify all prerequisites are installed and running
3. Try starting services individually to isolate the problem
4. Check the network and firewall settings
