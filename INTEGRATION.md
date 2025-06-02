# DigiClick AI Platform Integration Guide

This guide explains how the database, API, and frontend components are integrated in the DigiClick AI platform.

## Architecture Overview

The platform consists of three main components:

1. **Backend API**: Express.js server that handles authentication, services, and contact forms
2. **Database**: MongoDB for storing user data, services, and application state
3. **Next.js Frontend**: React-based frontend with custom cursor system and AI automation features

## Database Setup

The DigiClick AI platform uses MongoDB for data storage. To set up the database:

```bash
# Install MongoDB dependencies
npm install mongodb mongoose

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB connection string
```

This will:
- Connect to MongoDB Atlas or local MongoDB instance
- Set up collections for users, services, and contact forms
- Initialize the database with default AI services data

## API Integration

DigiClick AI services and data can be managed through the backend API:

```bash
# Start the backend API server
npm run dev:api

# Or use the deployed backend
# API URL: https://digiclick-ai-backend.onrender.com
```

The API provides:
- Authentication endpoints for user login/signup
- Services management for AI automation offerings
- Contact form handling with email notifications
- Portfolio management for showcasing AI projects
- Analytics and performance tracking

## Frontend Integration

The Next.js frontend integrates with the backend API and includes the custom cursor system:

1. **API Integration**: The `utils/api.js` file provides functions to communicate with the backend
2. **Custom Cursor**: The `components/CustomCursor` provides immersive cursor interactions
3. **Layout System**: The `components/Layout.js` integrates cursor with error boundaries and performance monitoring
4. **Authentication**: JWT-based authentication with protected routes and user management

### Running the Frontend

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run the development server
npm run dev
```

## Data Flow

1. **Frontend → API**: React components make requests to the backend API
2. **API → Database**: Express.js server queries MongoDB and returns JSON
3. **Database → Frontend**: Data flows through API to React components for rendering
4. **Cursor System**: Custom cursor enhances user interactions across all components

## Folder Structure

```
digiclick-ai/
├── components/                 # React components
│   ├── CustomCursor/          # Custom cursor system
│   │   ├── CustomCursor.js
│   │   ├── CustomCursor.module.css
│   │   └── index.js
│   ├── Layout.js              # Layout with cursor integration
│   ├── AuthModal.js           # Authentication modal
│   └── Portfolio.js           # Portfolio component
├── pages/                     # Next.js pages
│   ├── api/                   # API routes
│   ├── index.js               # Homepage with cursor
│   ├── cursor-demo.js         # Cursor demonstration
│   └── _app.js                # App with Layout integration
├── hooks/                     # Custom React hooks
│   └── useMousePosition.js    # Mouse tracking hook
├── styles/                    # CSS and styling
│   ├── globals.css            # Global styles with cursor classes
│   └── Home.module.css        # Enhanced homepage styles
├── utils/                     # Utility functions
│   └── api.js                 # API communication
├── scripts/                   # Deployment and utility scripts
│   ├── deploy.js              # Automated deployment
│   └── check-cursor.js        # Health check script
└── tests/                     # Test files
    └── cursor.test.js         # Cursor functionality tests
```

## Maintenance and Updates

To update the DigiClick AI platform:

1. Update services and content through the backend API
2. Deploy new features using the automated deployment scripts:
   ```bash
   npm run deploy:vercel
   ```
3. Monitor cursor performance with health check scripts:
   ```bash
   npm run check:cursor
   ```
4. Update custom cursor themes and interactions as needed

The system includes automated CI/CD through GitHub Actions for seamless updates and deployments.

## Troubleshooting

- **Database Connection Issues**: Check MongoDB connection string and network access
- **Cursor Not Appearing**: Run `npm run check:cursor` to verify cursor system health
- **Frontend Build Errors**: Make sure all dependencies are installed with `npm install`
- **API Connection Issues**: Verify backend API is running and CORS is configured correctly
- **Authentication Problems**: Check JWT configuration and token storage
- **Performance Issues**: Monitor cursor performance and disable effects if needed
