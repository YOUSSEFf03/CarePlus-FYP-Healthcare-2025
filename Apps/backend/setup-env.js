const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment variables...\n');

// Default environment variables
const defaultEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USERNAME: 'postgres',
  DB_PASSWORD: 'password',
  RABBITMQ_URL: 'amqp://localhost:5672',
  JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production',
  JWT_EXPIRES_IN: '15m',
  NODE_ENV: 'development'
};

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file with default values...');
  
  const envContent = Object.entries(defaultEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
} else {
  console.log('✅ .env file already exists');
}

console.log('\n📋 Environment Variables:');
Object.entries(defaultEnv).forEach(([key, value]) => {
  console.log(`  ${key}=${value}`);
});

console.log('\n💡 Make sure to:');
console.log('  1. Update the database password in .env file');
console.log('  2. Ensure PostgreSQL is running');
console.log('  3. Ensure RabbitMQ is running');
console.log('  4. Create the required databases if they don\'t exist');
console.log('\n🚀 Ready to start services with: npm run start:backend');
