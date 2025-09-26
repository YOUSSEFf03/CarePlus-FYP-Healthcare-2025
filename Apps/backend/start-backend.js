const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Healthcare FYP Backend Services...\n');

// Set common environment variables
const commonEnv = {
  ...process.env,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || '5432',
  DB_USERNAME: process.env.DB_USERNAME || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

const services = [
  { 
    name: 'Auth Service', 
    script: 'start:auth', 
    delay: 0,
    env: { ...commonEnv, DB_NAME: process.env.DB_NAME || 'auth_service' }
  },
  { 
    name: 'Doctor Service', 
    script: 'start:doctor', 
    delay: 3000,
    env: { ...commonEnv, DB_NAME: process.env.DB_NAME || 'doctor_service' }
  },
  { 
    name: 'Notification Service', 
    script: 'start:notification', 
    delay: 3000,
    env: { ...commonEnv, DB_NAME: process.env.DB_NAME || 'notification_service' }
  },
  { 
    name: 'Pharmacy Service', 
    script: 'start:pharmacy', 
    delay: 3000,
    env: { ...commonEnv, DB_NAME: process.env.DB_NAME || 'pharmacy_service' }
  },
  { 
    name: 'Gateway Service', 
    script: 'start:gateway', 
    delay: 5000,
    env: commonEnv
  }
];

const processes = [];

function startService(service) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`📡 Starting ${service.name}...`);
      
      const child = spawn('npm', ['run', service.script], {
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd(),
        env: service.env
      });
      
      processes.push(child);
      
      child.on('error', (error) => {
        console.error(`❌ Error starting ${service.name}:`, error.message);
      });
      
      child.on('exit', (code) => {
        if (code !== 0) {
          console.error(`❌ ${service.name} exited with code ${code}`);
        }
      });
      
      // Give the service a moment to start
      setTimeout(() => {
        console.log(`✅ ${service.name} started`);
        resolve();
      }, 2000);
      
    }, service.delay);
  });
}

async function startAllServices() {
  try {
    for (const service of services) {
      await startService(service);
    }
    
    console.log('\n🎉 All services are starting!');
    console.log('\n📋 Service Status:');
    console.log('- Auth Service: RabbitMQ queue "auth_queue"');
    console.log('- Doctor Service: RabbitMQ queue "doctor_queue"');
    console.log('- Notification Service: RabbitMQ queue "notification_queue"');
    console.log('- Pharmacy Service: RabbitMQ queue "pharmacy_queue"');
    console.log('- Gateway Service: http://localhost:3000');
    console.log('\n💡 Press Ctrl+C to stop all services');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down all services...');
      processes.forEach(process => {
        if (process && !process.killed) {
          process.kill('SIGTERM');
        }
      });
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error starting services:', error);
    process.exit(1);
  }
}

startAllServices();
