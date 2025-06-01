#!/usr/bin/env node

/**
 * DigiClick AI Environment Setup Script
 * Interactive script to help configure environment variables
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function log(message, color = 'reset') {
  console.log(colorize(message, color));
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(colorize(prompt, 'cyan'), resolve);
  });
}

function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

async function setupEnvironment() {
  log('\n🚀 DigiClick AI Environment Setup', 'bright');
  log('=====================================', 'blue');
  log('This script will help you configure your environment variables.\n', 'yellow');

  const envConfig = {};

  // Environment selection
  const environment = await question('Select environment (development/production) [development]: ') || 'development';
  envConfig.NODE_ENV = environment;

  log(`\n📝 Configuring for ${environment} environment...\n`, 'green');

  // Basic configuration
  log('🔧 Basic Configuration', 'bright');
  log('----------------------', 'blue');

  envConfig.PORT = await question('Port number [3000]: ') || '3000';

  if (environment === 'production') {
    envConfig.NEXT_PUBLIC_APP_URL = await question('Production app URL (e.g., https://digiclick.ai): ');
    envConfig.NEXT_PUBLIC_API_URL = await question('Production API URL (e.g., https://api.digiclick.ai): ');
  } else {
    envConfig.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    envConfig.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
  }

  // Authentication
  log('\n🔐 Authentication Configuration', 'bright');
  log('-------------------------------', 'blue');

  const generateSecrets = await question('Generate secure JWT secrets automatically? (y/n) [y]: ') || 'y';
  
  if (generateSecrets.toLowerCase() === 'y') {
    envConfig.JWT_SECRET = generateSecureSecret();
    envConfig.JWT_REFRESH_SECRET = generateSecureSecret();
    log('✅ JWT secrets generated automatically', 'green');
  } else {
    envConfig.JWT_SECRET = await question('JWT Secret (leave empty to generate): ') || generateSecureSecret();
    envConfig.JWT_REFRESH_SECRET = await question('JWT Refresh Secret (leave empty to generate): ') || generateSecureSecret();
  }

  // Database configuration
  log('\n🗄️  Database Configuration', 'bright');
  log('---------------------------', 'blue');

  const useAtlas = await question('Use MongoDB Atlas? (y/n) [y]: ') || 'y';
  
  if (useAtlas.toLowerCase() === 'y') {
    const mongoUser = await question('MongoDB Atlas username: ');
    const mongoPass = await question('MongoDB Atlas password: ');
    const mongoCluster = await question('MongoDB Atlas cluster [cluster0]: ') || 'cluster0';
    const mongoDb = await question('Database name [digiclick-ai]: ') || 'digiclick-ai';
    
    envConfig.MONGODB_URI = `mongodb+srv://${mongoUser}:${mongoPass}@${mongoCluster}.mongodb.net/${mongoDb}`;
    envConfig.MONGO_URI = envConfig.MONGODB_URI;
  } else {
    envConfig.MONGODB_URI = await question('MongoDB URI [mongodb://localhost:27017/digiclick-ai]: ') || 'mongodb://localhost:27017/digiclick-ai';
    envConfig.MONGO_URI = envConfig.MONGODB_URI;
  }

  // Redis configuration
  log('\n🔴 Redis Configuration', 'bright');
  log('----------------------', 'blue');

  const useRedis = await question('Configure Redis? (y/n) [y]: ') || 'y';
  
  if (useRedis.toLowerCase() === 'y') {
    const redisHost = await question('Redis host [localhost]: ') || 'localhost';
    const redisPort = await question('Redis port [6379]: ') || '6379';
    const redisPass = await question('Redis password (leave empty if none): ');
    
    if (redisPass) {
      envConfig.REDIS_URL = `redis://:${redisPass}@${redisHost}:${redisPort}`;
      envConfig.REDIS_PASSWORD = redisPass;
    } else {
      envConfig.REDIS_URL = `redis://${redisHost}:${redisPort}`;
    }
  }

  // Email configuration
  log('\n📧 Email Configuration', 'bright');
  log('----------------------', 'blue');

  envConfig.EMAIL_USER = await question('Email address (for sending emails): ');
  envConfig.EMAIL_PASS = await question('Email app password: ');
  envConfig.EMAIL_HOST = await question('SMTP host [smtp.gmail.com]: ') || 'smtp.gmail.com';
  envConfig.EMAIL_PORT = await question('SMTP port [587]: ') || '587';
  envConfig.EMAIL_FROM = await question('From email address [noreply@digiclick.ai]: ') || 'noreply@digiclick.ai';

  // Optional services
  log('\n🔌 Optional Services', 'bright');
  log('--------------------', 'blue');

  const configureGoogle = await question('Configure Google OAuth? (y/n) [n]: ') || 'n';
  if (configureGoogle.toLowerCase() === 'y') {
    envConfig.GOOGLE_CLIENT_ID = await question('Google Client ID: ');
    envConfig.GOOGLE_CLIENT_SECRET = await question('Google Client Secret: ');
    envConfig.NEXT_PUBLIC_GOOGLE_CLIENT_ID = envConfig.GOOGLE_CLIENT_ID;
  }

  const configureStripe = await question('Configure Stripe payments? (y/n) [n]: ') || 'n';
  if (configureStripe.toLowerCase() === 'y') {
    const stripeEnv = environment === 'production' ? 'live' : 'test';
    envConfig.STRIPE_PUBLISHABLE_KEY = await question(`Stripe ${stripeEnv} publishable key: `);
    envConfig.STRIPE_SECRET_KEY = await question(`Stripe ${stripeEnv} secret key: `);
    envConfig.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = envConfig.STRIPE_PUBLISHABLE_KEY;
  }

  // Security settings
  if (environment === 'production') {
    log('\n🔒 Security Configuration', 'bright');
    log('-------------------------', 'blue');
    
    envConfig.CORS_ORIGIN = envConfig.NEXT_PUBLIC_APP_URL;
    envConfig.RATE_LIMIT_WINDOW_MS = '900000';
    envConfig.RATE_LIMIT_MAX_REQUESTS = '100';
    envConfig.BCRYPT_SALT_ROUNDS = '12';
  }

  // Generate .env file
  const envFileName = environment === 'production' ? '.env.production.local' : '.env.local';
  const envPath = path.join(process.cwd(), envFileName);

  log(`\n📄 Generating ${envFileName}...`, 'bright');

  let envContent = `# DigiClick AI Environment Variables - ${environment.toUpperCase()}\n`;
  envContent += `# Generated on ${new Date().toISOString()}\n\n`;

  Object.entries(envConfig).forEach(([key, value]) => {
    envContent += `${key}=${value}\n`;
  });

  // Add feature flags
  envContent += '\n# Feature Flags\n';
  envContent += 'ENABLE_CHATBOT=true\n';
  envContent += 'ENABLE_FILE_UPLOAD=true\n';
  envContent += `ENABLE_GOOGLE_AUTH=${configureGoogle.toLowerCase() === 'y'}\n`;
  envContent += `ENABLE_STRIPE_PAYMENTS=${configureStripe.toLowerCase() === 'y'}\n`;

  fs.writeFileSync(envPath, envContent);

  log(`✅ Environment file created: ${envFileName}`, 'green');
  log('\n🎉 Setup completed successfully!', 'bright');
  log('\nNext steps:', 'yellow');
  log('1. Review the generated .env file', 'cyan');
  log('2. Install dependencies: npm install', 'cyan');
  log('3. Start development: npm run dev', 'cyan');
  
  if (environment === 'production') {
    log('4. Deploy to production: npm run deploy:production', 'cyan');
  }

  log('\n📖 For more information, see DEPLOYMENT.md', 'blue');
}

async function main() {
  try {
    await setupEnvironment();
  } catch (error) {
    log(`\n❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { setupEnvironment };
