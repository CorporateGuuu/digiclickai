# DigiClick AI Environment Configuration Guide

## Overview

This guide covers the complete environment configuration for DigiClick AI, including all required and optional environment variables for development, staging, and production environments.

## Quick Setup

### Automated Setup (Recommended)
```bash
# Interactive setup for development
npm run setup

# Setup for production
npm run setup:production

# Validate current environment
npm run validate-env
```

### Manual Setup
```bash
# Copy the example file
cp .env.example .env.local

# Edit the file with your values
nano .env.local
```

## Environment Variables Reference

### 🔧 **Core Application Settings**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Application environment |
| `PORT` | Yes | `3000` | Server port number |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` | Frontend application URL |
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:3001` | Backend API URL |

### 🔐 **Authentication & Security**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | Yes | - | Secret key for JWT tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | - | Secret key for refresh tokens |
| `JWT_EXPIRES_IN` | No | `1h` | JWT token expiration time |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token expiration time |
| `NEXT_PUBLIC_JWT_STORAGE_KEY` | No | `digiclick_ai_token` | Local storage key for tokens |
| `BCRYPT_SALT_ROUNDS` | No | `12` | Bcrypt salt rounds for password hashing |

### 🗄️ **Database Configuration**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `MONGO_URI` | Yes | - | Alternative MongoDB URI (for compatibility) |
| `MONGODB_DB_NAME` | No | `digiclick-ai` | Database name |

**Example MongoDB URIs:**
```bash
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/digiclick-ai

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/digiclick-ai
```

### 🔴 **Redis Configuration**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | Prod | - | Redis connection URL |
| `REDIS_PASSWORD` | No | - | Redis password (if required) |
| `REDIS_DB` | No | `0` | Redis database number |

**Example Redis URLs:**
```bash
# Local Redis
REDIS_URL=redis://localhost:6379

# Remote Redis with auth
REDIS_URL=redis://:password@redis-host:6379

# Redis Cloud
REDIS_URL=redis://username:password@redis-host:port
```

### 📧 **Email Configuration**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EMAIL_HOST` | Yes | `smtp.gmail.com` | SMTP server host |
| `EMAIL_PORT` | No | `587` | SMTP server port |
| `EMAIL_SECURE` | No | `false` | Use SSL/TLS |
| `EMAIL_USER` | Yes | - | SMTP username/email |
| `EMAIL_PASS` | Yes | - | SMTP password/app password |
| `EMAIL_FROM` | No | `noreply@digiclick.ai` | Default sender email |

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password as `EMAIL_PASS`

### 🔌 **OAuth Integration**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | No | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | - | Google OAuth client secret |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | No | - | Public Google client ID |

### 💳 **Payment Processing**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STRIPE_PUBLISHABLE_KEY` | No | - | Stripe publishable key |
| `STRIPE_SECRET_KEY` | No | - | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | - | Stripe webhook endpoint secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | - | Public Stripe key |

### 📁 **File Upload**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MAX_FILE_SIZE` | No | `10485760` | Max file size in bytes (10MB) |
| `ALLOWED_FILE_TYPES` | No | `image/jpeg,image/png...` | Allowed MIME types |
| `UPLOAD_DIR` | No | `./uploads` | Local upload directory |
| `CLOUDINARY_CLOUD_NAME` | No | - | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | - | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | - | Cloudinary API secret |

### 🔒 **Security & CORS**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CORS_ORIGIN` | Prod | - | Allowed CORS origins |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | No | `100` | Max requests per window |

### 📊 **Analytics & Monitoring**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_ANALYTICS_ID` | No | - | Google Analytics tracking ID |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | No | - | Public GA tracking ID |
| `SENTRY_DSN` | No | - | Sentry error tracking DSN |
| `NEXT_PUBLIC_SENTRY_DSN` | No | - | Public Sentry DSN |

### 🚀 **Deployment**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VERCEL_TOKEN` | Deploy | - | Vercel deployment token |
| `VERCEL_ORG_ID` | Deploy | - | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Deploy | - | Vercel project ID |
| `RENDER_API_KEY` | Deploy | - | Render API key |
| `RENDER_SERVICE_ID` | Deploy | - | Render service ID |

### 🎛️ **Feature Flags**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENABLE_CHATBOT` | No | `true` | Enable AI chatbot |
| `ENABLE_FILE_UPLOAD` | No | `true` | Enable file uploads |
| `ENABLE_GOOGLE_AUTH` | No | `true` | Enable Google OAuth |
| `ENABLE_STRIPE_PAYMENTS` | No | `true` | Enable Stripe payments |

## Environment-Specific Configurations

### Development Environment
```bash
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# Minimal required variables
JWT_SECRET=your_jwt_secret
MONGODB_URI=mongodb+srv://user:pass@cluster0.mongodb.net/digiclick-ai
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

### Production Environment
```bash
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://digiclick.ai
NEXT_PUBLIC_API_URL=https://api.digiclick.ai

# All security variables required
JWT_SECRET=secure-production-secret
JWT_REFRESH_SECRET=secure-refresh-secret
MONGODB_URI=mongodb+srv://prod-user:pass@cluster0.mongodb.net/digiclick-ai
REDIS_URL=redis://redis-host:6379
CORS_ORIGIN=https://digiclick.ai
```

## Security Best Practices

### 🔐 **Secret Management**
- Use strong, randomly generated secrets (32+ characters)
- Never commit secrets to version control
- Use different secrets for each environment
- Rotate secrets regularly

### 🛡️ **Production Security**
- Enable HTTPS/SSL for all URLs
- Configure CORS properly
- Use strong database passwords
- Enable rate limiting
- Set up monitoring and alerts

### 📝 **Environment Files**
- Use `.env.local` for development
- Use `.env.production.local` for production
- Never commit `.env*` files to git
- Use platform-specific secret management in production

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check URI format and credentials
   - Verify network access and IP whitelist
   - Ensure database exists

2. **JWT Token Issues**
   - Verify JWT_SECRET is set and consistent
   - Check token expiration settings
   - Ensure secrets are properly encoded

3. **Email Not Sending**
   - Verify SMTP credentials
   - Check app password for Gmail
   - Confirm firewall/network settings

4. **Redis Connection Failed**
   - Verify Redis URL format
   - Check Redis server status
   - Confirm authentication if required

### Validation Commands
```bash
# Validate current environment
npm run validate-env

# Test database connection
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('DB Connected')).catch(console.error)"

# Test email configuration
node -e "require('nodemailer').createTransporter({host: process.env.EMAIL_HOST, auth: {user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS}}).verify().then(() => console.log('Email OK')).catch(console.error)"
```

## Support

For additional help with environment configuration:
1. Run the interactive setup: `npm run setup`
2. Check the validation output: `npm run validate-env`
3. Review the example files: `.env.example` and `.env.production.example`
4. Consult the deployment guide: `DEPLOYMENT.md`
