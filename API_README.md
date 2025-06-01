# DigiClick AI Backend API

This is the backend API for the DigiClick AI website, built with Express.js and MongoDB.

## Features

- **Contact Form API**: Handle contact form submissions
- **Demo Scheduling**: Schedule automation demos
- **Services Management**: Manage AI services
- **Data Validation**: Input validation and sanitization
- **Rate Limiting**: Prevent API abuse
- **CORS Support**: Cross-origin resource sharing
- **Security Headers**: Helmet.js for security

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   - Copy `.env.local` and update the values:
   ```bash
   cp .env.local .env
   ```
   - Update `MONGODB_URI` with your MongoDB connection string
   - Update `NEXT_PUBLIC_API_URL` for production deployment

3. **Start MongoDB**
   - For local MongoDB:
   ```bash
   mongod
   ```
   - Or use MongoDB Atlas cloud service

## Running the API

### Development Mode
```bash
npm run api:dev
```
This starts the API server with nodemon for auto-restart on file changes.

### Production Mode
```bash
npm run api
```

The API server will run on `http://localhost:3001` by default.

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns API status

### Contact Form
- **POST** `/api/contact`
- Body: `{ name, email, message, serviceInterest? }`
- Validates and stores contact form submissions

### Demo Scheduling
- **POST** `/api/demo`
- Body: `{ name, email, company?, demoTime }`
- Schedules automation demos

### Services
- **GET** `/api/services`
- Returns list of AI services

### Admin Endpoints (should be protected in production)
- **GET** `/api/contacts` - Get all contact submissions
- **GET** `/api/demos` - Get all demo requests

## Database Schema

### Contact
```javascript
{
  name: String (required),
  email: String (required),
  message: String (required),
  serviceInterest: String (optional),
  createdAt: Date (auto)
}
```

### Demo
```javascript
{
  name: String (required),
  email: String (required),
  company: String (optional),
  demoTime: String (required),
  createdAt: Date (auto)
}
```

### Service
```javascript
{
  title: String (required),
  description: String (required)
}
```

## Deployment Options

### Option 1: Heroku
1. Create a Heroku app
2. Add MongoDB Atlas add-on or use external MongoDB
3. Set environment variables in Heroku dashboard
4. Deploy using Git

### Option 2: Railway
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Option 3: DigitalOcean App Platform
1. Create a new app from GitHub
2. Configure environment variables
3. Deploy

### Option 4: Vercel (Serverless Functions)
Convert to Vercel API routes for serverless deployment.

## Frontend Integration

The Next.js frontend is already configured to use this API. Make sure to:

1. Update `NEXT_PUBLIC_API_URL` in `.env.local`
2. Deploy the API before deploying the frontend
3. Update CORS origins in `api-server.js` for production

## Security Considerations

- Add authentication for admin endpoints
- Use environment variables for sensitive data
- Enable HTTPS in production
- Implement proper error handling
- Add request logging
- Use MongoDB connection pooling

## Testing

You can test the API endpoints using:

- **Postman** or **Insomnia**
- **curl** commands
- **Frontend contact form**

Example curl command:
```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Test message"}'
```
