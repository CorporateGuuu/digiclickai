#!/bin/bash

# DigiClick AI - GitHub Push Script
# Prepares and pushes the complete project to GitHub

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}🔄 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${BLUE}"
    echo "=================================================="
    echo "🎯 DigiClick AI - GitHub Push Script"
    echo "=================================================="
    echo -e "${NC}"
}

# Check if git is initialized
check_git_init() {
    if [ ! -d ".git" ]; then
        print_status "Initializing Git repository..."
        git init
        print_success "Git repository initialized"
    else
        print_success "Git repository already initialized"
    fi
}

# Check if remote origin exists
check_git_remote() {
    if ! git remote get-url origin > /dev/null 2>&1; then
        print_warning "No remote origin found"
        echo "Please add your GitHub repository URL:"
        echo "Example: git remote add origin https://github.com/your-username/digiclick-ai.git"
        read -p "Enter your GitHub repository URL: " repo_url
        
        if [ -n "$repo_url" ]; then
            git remote add origin "$repo_url"
            print_success "Remote origin added: $repo_url"
        else
            print_error "No repository URL provided. Exiting."
            exit 1
        fi
    else
        origin_url=$(git remote get-url origin)
        print_success "Remote origin found: $origin_url"
    fi
}

# Run pre-push checks
run_pre_push_checks() {
    print_status "Running pre-push checks..."
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install
    fi
    
    # Run cursor health check
    print_status "Running cursor health check..."
    if npm run check:cursor; then
        print_success "Cursor health check passed"
    else
        print_error "Cursor health check failed"
        exit 1
    fi
    
    # Run tests
    print_status "Running tests..."
    if npm run test:cursor; then
        print_success "Cursor tests passed"
    else
        print_error "Cursor tests failed"
        exit 1
    fi
    
    # Check if build works
    print_status "Testing build..."
    if npm run build; then
        print_success "Build successful"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Stage files for commit
stage_files() {
    print_status "Staging files for commit..."
    
    # Add all DigiClick AI files
    git add .
    
    # Show what will be committed
    echo ""
    print_status "Files to be committed:"
    git status --short
    echo ""
}

# Create commit
create_commit() {
    print_status "Creating commit..."
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        print_warning "No changes to commit"
        return 0
    fi
    
    # Get commit message
    echo "Enter commit message (or press Enter for default):"
    read -p "Commit message: " commit_message
    
    if [ -z "$commit_message" ]; then
        commit_message="🎯 Add DigiClick AI custom cursor system with deployment infrastructure

- ✨ Complete custom cursor implementation with particle trails
- 🎨 Enhanced Layout component with cursor integration
- 🧪 Comprehensive test suite for cursor functionality
- 🚀 Automated deployment scripts for Vercel/Netlify
- 📚 Complete documentation and deployment guides
- ⚡ Performance optimizations and accessibility features
- 🔧 GitHub Actions workflow for CI/CD
- 📱 Mobile responsive with touch device detection"
    fi
    
    git commit -m "$commit_message"
    print_success "Commit created successfully"
}

# Push to GitHub
push_to_github() {
    print_status "Pushing to GitHub..."
    
    # Get current branch
    current_branch=$(git branch --show-current)
    
    if [ -z "$current_branch" ]; then
        current_branch="main"
        git checkout -b main
        print_status "Created and switched to main branch"
    fi
    
    print_status "Pushing to origin/$current_branch..."
    
    # Push with upstream set
    if git push -u origin "$current_branch"; then
        print_success "Successfully pushed to GitHub!"
        
        # Get repository URL for display
        repo_url=$(git remote get-url origin)
        repo_url=${repo_url%.git}  # Remove .git suffix if present
        
        echo ""
        print_success "🎉 DigiClick AI project successfully pushed to GitHub!"
        echo ""
        echo -e "${GREEN}📋 Next Steps:${NC}"
        echo "1. 🌐 Visit your repository: $repo_url"
        echo "2. 🔧 Set up deployment secrets in GitHub repository settings"
        echo "3. 🚀 Deploy to Vercel: npm run deploy:vercel"
        echo "4. 🎯 Test cursor functionality: [your-domain]/cursor-demo"
        echo ""
        echo -e "${BLUE}🔗 Important URLs after deployment:${NC}"
        echo "• Live Site: https://your-domain.com"
        echo "• Cursor Demo: https://your-domain.com/cursor-demo"
        echo "• Enhanced Demo: https://your-domain.com/enhanced-demo"
        echo ""
    else
        print_error "Failed to push to GitHub"
        exit 1
    fi
}

# Verify deployment readiness
verify_deployment_readiness() {
    print_status "Verifying deployment readiness..."
    
    # Check required files
    required_files=(
        "components/CustomCursor/CustomCursor.js"
        "components/CustomCursor/CustomCursor.module.css"
        "components/Layout.js"
        "hooks/useMousePosition.js"
        "pages/cursor-demo.js"
        "scripts/deploy.js"
        "scripts/check-cursor.js"
        "tests/cursor.test.js"
        "DEPLOYMENT_GUIDE.md"
        "DEPLOYMENT_CHECKLIST.md"
        ".env.example"
        "vercel.json"
        ".github/workflows/deploy.yml"
    )
    
    missing_files=()
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        print_success "All required files present"
    else
        print_error "Missing required files:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        exit 1
    fi
    
    # Check package.json for required scripts
    if ! grep -q "check:cursor" package.json; then
        print_error "Missing cursor scripts in package.json"
        exit 1
    fi
    
    print_success "Deployment readiness verified"
}

# Main execution
main() {
    print_header
    
    # Run all checks and operations
    check_git_init
    check_git_remote
    verify_deployment_readiness
    run_pre_push_checks
    stage_files
    create_commit
    push_to_github
    
    print_success "🎯 DigiClick AI project is now ready for deployment!"
}

# Run main function
main "$@"
