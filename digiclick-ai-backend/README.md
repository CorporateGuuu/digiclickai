# DigiClick AI Backend API

🚀 **Professional Express.js API for DigiClick AI - Premium AI Web Design & Automation**

## 🌟 Features

- **Express.js** server with MongoDB integration
- **Contact Form API** with validation, rate limiting, and email notifications
- **Demo Scheduling** system with email confirmations
- **Dynamic Services** management with fallback data
- **Portfolio Management** with rich project details
- **JWT Authentication** for user accounts and admin access
- **Email Notifications** for form submissions and confirmations
- **Security** headers, CORS protection, and password hashing
- **Fallback Systems** for offline/demo mode
- **Admin Endpoints** for data management
- **Production Ready** with comprehensive error handling

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Start MongoDB (if using local)
```bash
# macOS with Homebrew
brew services start mongodb/brew/mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 4. Run the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The API will be available at: **http://localhost:3001**

## 📡 API Endpoints

### Health Check
- **GET** `/api/health`
- Returns server status, MongoDB connection, and email configuration

### Contact Form
- **POST** `/api/contact`
- **Body**: `{ name, email, message, serviceInterest? }`
- Validates, stores contact submissions, and sends email notifications

### Demo Scheduling
- **POST** `/api/demo`
- **Body**: `{ name, email, company?, demoTime, phone?, requirements? }`
- Schedules automation demos with email confirmations

### Services
- **GET** `/api/services`
- Returns list of AI services (dynamic or fallback)

### Portfolio
- **GET** `/api/portfolio`
- Returns portfolio projects with details and results

### Authentication
- **POST** `/api/auth/signup` - User registration with JWT token
- **POST** `/api/auth/login` - User login with JWT token

### User Endpoints (Protected)
- **GET** `/api/user/demos` - Get user's demo schedules (requires JWT)

### Admin Endpoints (Protected)
- **GET** `/api/admin/contacts` - View all contact submissions
- **GET** `/api/admin/demos` - View all demo requests

## 🧪 Testing the API

### Using curl
```bash
# Health check
curl http://localhost:3001/api/health

# Get services
curl http://localhost:3001/api/services

# Submit contact form
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Interested in AI website development",
    "serviceInterest": "AI-Crafted Websites"
  }'
```

### Using Postman
Import the following endpoints:
- `GET http://localhost:3001/api/health`
- `GET http://localhost:3001/api/services`
- `POST http://localhost:3001/api/contact`
- `POST http://localhost:3001/api/demo`

## 🗄️ Database Schema

### Contact
```javascript
{
  name: String (required, 2-100 chars),
  email: String (required, valid email),
  message: String (required, 10-1000 chars),
  serviceInterest: String (optional),
  ipAddress: String,
  userAgent: String,
  createdAt: Date
}
```

### Demo
```javascript
{
  name: String (required),
  email: String (required),
  company: String (optional),
  demoTime: String (required),
  phone: String (optional),
  requirements: String (optional),
  createdAt: Date
}
```

### Service
```javascript
{
  title: String (required),
  description: String (required),
  icon: String,
  features: [String],
  price: String,
  isActive: Boolean,
  order: Number,
  createdAt: Date
}
```

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable allowed origins
- **Helmet.js**: Security headers
- **Input Validation**: Express-validator for all inputs
- **Data Sanitization**: Trim and normalize inputs
- **Error Handling**: Comprehensive error responses

## 🌐 Deployment

### Heroku
```bash
# Install Heroku CLI and login
heroku create digiclick-ai-api
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set NODE_ENV=production
git push heroku main
```

### Railway
```bash
# Connect GitHub repository
# Set environment variables in Railway dashboard
# Deploy automatically on push
```

### DigitalOcean App Platform
```bash
# Create app from GitHub
# Configure environment variables
# Deploy with auto-scaling
```

## 🔧 Configuration

### Environment Variables
```bash
PORT=3001                    # Server port
NODE_ENV=development         # Environment
MONGODB_URI=mongodb://...    # Database connection
CORS_ORIGINS=http://...      # Allowed origins
```

### MongoDB Setup Options

#### Option 1: Local MongoDB
```bash
# Install MongoDB
brew install mongodb/brew/mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Option 2: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster and database
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## 📊 Monitoring

### Logs
The server provides detailed logging:
- ✅ Successful operations
- ❌ Errors and warnings
- 📧 Contact form submissions
- 🎯 Demo requests
- 🔗 Database connections

### Health Monitoring
Check `/api/health` endpoint for:
- Server status
- Database connection
- Uptime
- Timestamp

## 🚨 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb/brew/mongodb-community
```

**Port Already in Use**
```bash
# Find process using port 3001
lsof -ti:3001

# Kill process
kill -9 $(lsof -ti:3001)
```

**CORS Errors**
- Update `CORS_ORIGINS` in `.env`
- Ensure frontend URL is included

## 📈 Performance

- **Rate Limiting**: Prevents API abuse
- **Connection Pooling**: MongoDB connection optimization
- **Error Caching**: Fallback systems for reliability
- **Graceful Shutdown**: Proper cleanup on termination

## 🔮 Future Enhancements

- [ ] JWT Authentication for admin endpoints
- [ ] Email notifications for form submissions
- [ ] File upload support for portfolios
- [ ] Analytics and reporting dashboard
- [ ] Webhook integrations
- [ ] API documentation with Swagger

## 📞 Support

For issues or questions:
- **Email**: support@digiclick.ai
- **GitHub**: Create an issue
- **Documentation**: Check this README

---

**DigiClick AI Backend** - Powering the future of AI-driven web solutions! 🚀
