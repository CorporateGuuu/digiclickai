# DigiClick AI Deployment Guide

## Overview

This guide covers the complete deployment process for the DigiClick AI application, including both frontend and backend components.

## Architecture

- **Frontend**: Next.js application deployed on Vercel
- **Backend**: Node.js/Express API deployed on Render
- **Database**: MongoDB Atlas
- **CDN**: Vercel Edge Network
- **Monitoring**: GitHub Actions + Custom health checks

## Prerequisites

### Required Tools
- Node.js 18+ 
- npm or yarn
- Git
- Docker (optional)

### Required Accounts
- GitHub (for CI/CD)
- Vercel (for frontend hosting)
- Render (for backend hosting)
- MongoDB Atlas (for database)

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

#### Required Variables for Production:
```env
# Application
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_APP_URL=https://digiclick.ai

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/digiclick_ai

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Deployment
VERCEL_TOKEN=your-vercel-token
RENDER_API_KEY=your-render-api-key
RENDER_SERVICE_ID=your-service-id
```

## Deployment Methods

### 1. Automated Deployment (Recommended)

#### GitHub Actions (CI/CD)
The repository includes automated workflows:

- **`.github/workflows/ci-cd.yml`** - Complete CI/CD pipeline
- **`.github/workflows/deploy-frontend.yml`** - Frontend-specific deployment
- **`.github/workflows/deploy-backend.yml`** - Backend-specific deployment

**Setup:**
1. Add secrets to GitHub repository settings
2. Push to `main` branch triggers production deployment
3. Push to `develop` branch triggers staging deployment

**Required GitHub Secrets:**
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
RENDER_API_KEY
RENDER_SERVICE_ID
NEXT_PUBLIC_API_URL
SLACK_WEBHOOK_URL (optional)
```

### 2. Manual Deployment

#### Using Deployment Script
```bash
# Deploy everything to production
npm run deploy:production

# Deploy only frontend
npm run deploy:frontend

# Deploy only backend
npm run deploy:backend

# Deploy to staging
npm run deploy:staging

# Hotfix deployment (skip tests)
npm run deploy:hotfix
```

#### Manual Steps

**Frontend (Vercel):**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

**Backend (Render):**
```bash
# Using Render API
curl -X POST https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys \
  -H "Authorization: Bearer $RENDER_API_KEY"
```

### 3. Docker Deployment

#### Build and Run Locally
```bash
# Build Docker image
npm run docker:build

# Run container
npm run docker:run

# Development with Docker Compose
npm run docker:dev

# Production with Docker Compose
npm run docker:prod
```

#### Deploy to Container Platform
```bash
# Build and push to registry
docker build -t ghcr.io/yourusername/digiclick-ai .
docker push ghcr.io/yourusername/digiclick-ai

# Deploy to your container platform
```

## Platform-Specific Configuration

### Vercel Configuration

**vercel.json** includes:
- Build settings
- Environment variables
- Headers and security
- Redirects and rewrites
- Function timeouts

**Key Features:**
- Automatic HTTPS
- Global CDN
- Serverless functions
- Preview deployments

### Render Configuration

**render.yaml** includes:
- Service definitions
- Environment variables
- Health checks
- Database connections

**Key Features:**
- Automatic deployments
- Health monitoring
- Managed databases
- SSL certificates

## Environment-Specific Deployments

### Staging Environment
- **URL**: https://staging-digiclick.vercel.app
- **Backend**: https://staging-api.onrender.com
- **Database**: Staging MongoDB cluster
- **Purpose**: Testing and QA

### Production Environment
- **URL**: https://digiclick.ai
- **Backend**: https://api.digiclick.ai
- **Database**: Production MongoDB cluster
- **Purpose**: Live application

## Monitoring and Health Checks

### Automated Monitoring
- GitHub Actions health checks
- Vercel deployment monitoring
- Render service monitoring

### Manual Health Checks
```bash
# Check frontend
curl -f https://digiclick.ai

# Check backend API
curl -f https://api.digiclick.ai/api/health

# Run local health check
npm run health-check
```

### Performance Monitoring
- Lighthouse CI in GitHub Actions
- Core Web Vitals tracking
- Error monitoring with Sentry (optional)

## Rollback Procedures

### Automatic Rollback
- Failed deployments automatically rollback
- Health check failures trigger alerts

### Manual Rollback

**Vercel:**
```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote [deployment-url]
```

**Render:**
```bash
# Redeploy previous version via API
curl -X POST https://api.render.com/v1/services/$SERVICE_ID/deploys \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -d '{"commitId": "previous-commit-hash"}'
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify environment variables
   - Review build logs

2. **Deployment Timeouts**
   - Increase timeout settings
   - Optimize build process
   - Check resource limits

3. **Health Check Failures**
   - Verify API endpoints
   - Check database connectivity
   - Review server logs

### Debug Commands
```bash
# Check deployment status
npm run deploy:status

# View logs
vercel logs
render logs $SERVICE_ID

# Test locally
npm run dev
npm run api:dev
```

## Security Considerations

### Environment Variables
- Never commit secrets to repository
- Use platform-specific secret management
- Rotate keys regularly

### HTTPS/SSL
- Automatic HTTPS on Vercel
- SSL certificates on Render
- Secure headers configuration

### CORS Configuration
- Restrict origins in production
- Configure allowed methods
- Set appropriate headers

## Performance Optimization

### Frontend
- Next.js automatic optimizations
- Image optimization
- Code splitting
- CDN caching

### Backend
- API response caching
- Database query optimization
- Rate limiting
- Compression

## Backup and Recovery

### Database Backups
- MongoDB Atlas automatic backups
- Point-in-time recovery
- Cross-region replication

### Code Backups
- Git repository backups
- Deployment artifacts
- Configuration backups

## Support and Maintenance

### Regular Tasks
- Monitor deployment metrics
- Update dependencies
- Review security alerts
- Performance optimization

### Emergency Procedures
- Incident response plan
- Communication channels
- Rollback procedures
- Recovery protocols

---

For additional support, contact the development team or refer to the platform-specific documentation.
