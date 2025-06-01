#!/bin/bash

# DigiClick AI Deployment Script
# Usage: ./scripts/deploy.sh [environment] [component]
# Example: ./scripts/deploy.sh production frontend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
COMPONENT=${2:-all}
PROJECT_NAME="digiclick-ai"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    log_info "Checking dependencies..."
    
    # Check if required tools are installed
    command -v node >/dev/null 2>&1 || { log_error "Node.js is required but not installed."; exit 1; }
    command -v npm >/dev/null 2>&1 || { log_error "npm is required but not installed."; exit 1; }
    command -v git >/dev/null 2>&1 || { log_error "git is required but not installed."; exit 1; }
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="16.0.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        log_error "Node.js version $REQUIRED_VERSION or higher is required. Current version: $NODE_VERSION"
        exit 1
    fi
    
    log_success "All dependencies are satisfied"
}

check_environment() {
    log_info "Checking environment configuration..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Check required environment variables for production
        required_vars=(
            "NEXT_PUBLIC_API_URL"
            "VERCEL_TOKEN"
            "RENDER_API_KEY"
            "RENDER_SERVICE_ID"
        )
        
        for var in "${required_vars[@]}"; do
            if [ -z "${!var}" ]; then
                log_error "Required environment variable $var is not set"
                exit 1
            fi
        done
    fi
    
    log_success "Environment configuration is valid"
}

run_tests() {
    log_info "Running tests..."
    
    # Install dependencies
    npm ci
    
    # Run linting
    log_info "Running ESLint..."
    npm run lint
    
    # Run type checking
    log_info "Running type checking..."
    npm run type-check
    
    # Run unit tests
    log_info "Running unit tests..."
    npm run test:ci
    
    # Run security audit
    log_info "Running security audit..."
    npm audit --audit-level moderate
    
    log_success "All tests passed"
}

build_application() {
    log_info "Building application..."
    
    # Set environment variables
    export NODE_ENV=production
    
    # Build the application
    npm run build
    
    log_success "Application built successfully"
}

deploy_frontend() {
    log_info "Deploying frontend to Vercel..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        npx vercel --prod --token "$VERCEL_TOKEN"
    else
        npx vercel --token "$VERCEL_TOKEN"
    fi
    
    log_success "Frontend deployed successfully"
}

deploy_backend() {
    log_info "Deploying backend to Render..."
    
    # Trigger Render deployment
    response=$(curl -s -X POST \
        "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
        -H "Authorization: Bearer $RENDER_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"clearCache": false}')
    
    deploy_id=$(echo "$response" | jq -r '.id')
    
    if [ "$deploy_id" = "null" ]; then
        log_error "Failed to trigger backend deployment"
        echo "$response"
        exit 1
    fi
    
    log_info "Backend deployment triggered. Deploy ID: $deploy_id"
    
    # Monitor deployment progress
    log_info "Monitoring deployment progress..."
    for i in {1..30}; do
        sleep 10
        status=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
            "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys/$deploy_id" | \
            jq -r '.status')
        
        log_info "Deploy status: $status"
        
        if [ "$status" = "live" ]; then
            log_success "Backend deployment completed successfully"
            break
        elif [ "$status" = "build_failed" ] || [ "$status" = "update_failed" ]; then
            log_error "Backend deployment failed"
            exit 1
        fi
        
        if [ $i -eq 30 ]; then
            log_warning "Deployment monitoring timed out"
        fi
    done
}

run_health_checks() {
    log_info "Running health checks..."
    
    # Frontend health check
    if [ "$COMPONENT" = "frontend" ] || [ "$COMPONENT" = "all" ]; then
        log_info "Checking frontend health..."
        sleep 30  # Wait for deployment to be ready
        
        if curl -f -s "$NEXT_PUBLIC_API_URL" > /dev/null; then
            log_success "Frontend is healthy"
        else
            log_error "Frontend health check failed"
            exit 1
        fi
    fi
    
    # Backend health check
    if [ "$COMPONENT" = "backend" ] || [ "$COMPONENT" = "all" ]; then
        log_info "Checking backend health..."
        
        backend_url="${NEXT_PUBLIC_API_URL}/api/health"
        for i in {1..5}; do
            if curl -f -s "$backend_url" > /dev/null; then
                log_success "Backend is healthy"
                break
            else
                log_info "Backend health check attempt $i failed, retrying..."
                sleep 10
            fi
            
            if [ $i -eq 5 ]; then
                log_error "Backend health check failed after 5 attempts"
                exit 1
            fi
        done
    fi
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove temporary files
    rm -rf .next/cache
    rm -rf node_modules/.cache
    
    log_success "Cleanup completed"
}

main() {
    log_info "Starting deployment for $PROJECT_NAME"
    log_info "Environment: $ENVIRONMENT"
    log_info "Component: $COMPONENT"
    
    # Pre-deployment checks
    check_dependencies
    check_environment
    
    # Run tests (skip for hotfixes)
    if [ "$3" != "--skip-tests" ]; then
        run_tests
    fi
    
    # Build application
    build_application
    
    # Deploy components
    case $COMPONENT in
        "frontend")
            deploy_frontend
            ;;
        "backend")
            deploy_backend
            ;;
        "all")
            deploy_backend
            deploy_frontend
            ;;
        *)
            log_error "Invalid component: $COMPONENT. Use 'frontend', 'backend', or 'all'"
            exit 1
            ;;
    esac
    
    # Post-deployment checks
    run_health_checks
    cleanup
    
    log_success "Deployment completed successfully! 🚀"
    log_info "Frontend: https://digiclick.ai"
    log_info "Backend: $NEXT_PUBLIC_API_URL"
}

# Run main function
main "$@"
