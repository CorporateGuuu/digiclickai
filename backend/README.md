# DigiClick AI Backend API

A comprehensive Express.js backend API for the DigiClick AI application, featuring JWT authentication, AI services integration, contact management, demo scheduling, and newsletter functionality.

## 🚀 Features

### Core Functionality
- **JWT Authentication** - Secure user registration, login, and session management
- **AI Services** - Chat, automation analysis, and business intelligence endpoints
- **Contact Management** - Form submissions with auto-response and admin management
- **Demo Scheduling** - Meeting booking system with calendar integration
- **Newsletter System** - Subscription management with email verification

### Security & Performance
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Input Validation** - Comprehensive validation using express-validator
- **Password Hashing** - bcrypt with configurable salt rounds
- **CORS Protection** - Configurable origin whitelist
- **Security Headers** - Helmet.js for security best practices
- **Request Sanitization** - MongoDB injection and XSS protection

### Infrastructure
- **MongoDB Integration** - Mongoose ODM with connection pooling
- **Email Services** - Nodemailer with Gmail SMTP support
- **Logging System** - Winston with file and console outputs
- **Health Monitoring** - Comprehensive health check endpoints
- **Error Handling** - Centralized error management with proper HTTP codes

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- MongoDB 4.4 or higher
- Gmail account for SMTP (or other email service)
- Environment variables configured

## 🛠️ Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

### Docker Development

1. **Using Docker Compose**
   ```bash
   # Start all services (API, MongoDB, Redis, Admin UIs)
   docker-compose up -d
   
   # View logs
   docker-compose logs -f api
   
   # Stop services
   docker-compose down
   ```

2. **Access Services**
   - API: http://localhost:5000
   - MongoDB Express: http://localhost:8081 (admin/admin123)
   - Redis Commander: http://localhost:8082

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/digiclick-ai
DB_NAME=digiclick-ai

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
FROM_EMAIL=noreply@digiclick.ai
FROM_NAME=DigiClick AI

# CORS
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App-Specific Password
3. Use your Gmail address as `SMTP_USER`
4. Use the app-specific password as `SMTP_PASS`

## 📚 API Documentation

### Base URL
- Development: `http://localhost:5000/api/v1`
- Production: `https://digiclick-ai-backend.onrender.com/api/v1`

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| POST | `/auth/logout` | User logout |
| GET | `/auth/profile` | Get user profile |
| PATCH | `/auth/profile` | Update user profile |
| PATCH | `/auth/change-password` | Change password |
| POST | `/auth/forgot-password` | Request password reset |
| PATCH | `/auth/reset-password/:token` | Reset password |

### AI Services Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/chat` | AI chatbot interaction |
| POST | `/ai/automation` | Automation analysis |
| POST | `/ai/analysis` | Business analysis |
| GET | `/ai/status` | AI services status |
| GET | `/ai/usage` | User API usage stats |

### Contact Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/contact` | Submit contact form |
| GET | `/contact` | Get all contacts (Admin) |
| GET | `/contact/:id` | Get single contact (Admin) |
| PATCH | `/contact/:id` | Update contact (Admin) |
| DELETE | `/contact/:id` | Delete contact (Admin) |

### Demo Scheduling

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/demo` | Schedule demo |
| GET | `/demo` | Get all demos (Admin) |
| GET | `/demo/:id` | Get single demo (Admin) |
| PATCH | `/demo/:id` | Update demo (Admin) |
| PATCH | `/demo/:id/confirm` | Confirm demo (Admin) |
| PATCH | `/demo/:id/reschedule` | Reschedule demo (Admin) |

### Newsletter Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/newsletter/subscribe` | Subscribe to newsletter |
| GET | `/newsletter/verify` | Verify email subscription |
| POST | `/newsletter/unsubscribe` | Unsubscribe from newsletter |
| PATCH | `/newsletter/preferences` | Update preferences |
| GET | `/newsletter/subscribers` | Get subscribers (Admin) |

### Health Check Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Basic health check |
| GET | `/health/detailed` | Detailed system health |
| GET | `/health/database` | Database health |
| GET | `/health/ready` | Readiness probe |
| GET | `/health/live` | Liveness probe |

## 🚀 Deployment

### Render.com Deployment

1. **Connect Repository**
   - Link your GitHub repository to Render
   - Select the backend directory as the root

2. **Configure Environment Variables**
   - Set all required environment variables in Render dashboard
   - Use the provided `render.yaml` for automatic configuration

3. **Deploy**
   - Render will automatically build and deploy your application
   - Health checks will ensure the service is running properly

### Manual Deployment

1. **Build the application**
   ```bash
   npm install --production
   ```

2. **Set environment variables**
   ```bash
   export NODE_ENV=production
   export MONGODB_URI=your-production-mongodb-uri
   # ... other environment variables
   ```

3. **Start the application**
   ```bash
   npm start
   ```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📊 Monitoring

### Health Checks
- Basic: `GET /health`
- Detailed: `GET /health/detailed`
- Database: `GET /health/database`

### Logging
- Application logs: `logs/combined.log`
- Error logs: `logs/error.log`
- Exception logs: `logs/exceptions.log`

### Metrics
- System metrics: `GET /health/metrics`
- API usage: Available through user profiles
- Database stats: Included in health checks

## 🔒 Security

### Authentication
- JWT tokens with configurable expiration
- Secure password hashing with bcrypt
- Account lockout after failed attempts
- Email verification for new accounts

### API Security
- Rate limiting per IP address
- CORS protection with origin whitelist
- Input validation and sanitization
- Security headers via Helmet.js
- MongoDB injection prevention

### Data Protection
- GDPR compliance features
- Data encryption in transit
- Secure cookie handling
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@digiclick.ai
- Documentation: [API Docs](https://digiclick-ai-backend.onrender.com/api/docs)
- Health Status: [Health Check](https://digiclick-ai-backend.onrender.com/health)

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- Authentication system with JWT
- AI services integration
- Contact and demo management
- Newsletter system
- Comprehensive health monitoring
