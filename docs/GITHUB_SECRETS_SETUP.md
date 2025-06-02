# GitHub Repository Secrets Configuration Guide

## 🔐 DigiClick AI Deployment Automation Setup

This guide will help you configure GitHub Repository Secrets for automated CI/CD deployment to Netlify.

---

## 📋 Prerequisites

- GitHub repository access with admin permissions
- Netlify account with DigiClick AI site deployed
- Basic understanding of GitHub Actions and environment variables

---

## 🚀 Step-by-Step Configuration

### 1. Navigate to Repository Settings

1. **Open your DigiClick AI GitHub repository**
   ```
   https://github.com/[your-username]/DigiclickAi.shop
   ```

2. **Access Repository Settings**
   - Click the **"Settings"** tab (top navigation)
   - In the left sidebar, click **"Secrets and variables"**
   - Select **"Actions"** from the dropdown menu

### 2. Obtain Required Tokens

#### 🔑 Netlify Authentication Token

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click your profile picture → **"User settings"**
3. Navigate to **"Applications"** → **"Personal access tokens"**
4. Click **"New access token"**
5. Name: `DigiClick AI Deployment`
6. **Copy the generated token** (save it securely)

#### 🆔 Netlify Site ID

1. Go to your DigiClick AI site in Netlify dashboard
2. Click **"Site settings"**
3. Under **"General"** → **"Site details"**
4. **Copy the Site ID** (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

---

## 🔧 Required Secrets Configuration

### Core Deployment Secrets

Click **"New repository secret"** for each of the following:

#### 1. NETLIFY_AUTH_TOKEN
```
Name: NETLIFY_AUTH_TOKEN
Value: [Your Netlify personal access token from step 2]
Description: Netlify authentication for automated deployments
```

#### 2. NETLIFY_SITE_ID
```
Name: NETLIFY_SITE_ID
Value: [Your Netlify site ID from step 2]
Description: Unique identifier for DigiClick AI Netlify site
```

### Environment Variables

#### 3. NEXT_PUBLIC_API_URL
```
Name: NEXT_PUBLIC_API_URL
Value: https://digiclick-ai-backend.onrender.com
Description: Backend API endpoint for DigiClick AI services
```

#### 4. NEXT_PUBLIC_APP_URL
```
Name: NEXT_PUBLIC_APP_URL
Value: https://digiclickai.netlify.app
Description: Frontend application URL for DigiClick AI
```

#### 5. NODE_ENV
```
Name: NODE_ENV
Value: production
Description: Node.js environment setting for production builds
```

### Optional Monitoring Secrets

#### 6. SENTRY_DSN (Optional)
```
Name: SENTRY_DSN
Value: [Your Sentry DSN if you have error tracking setup]
Description: Error tracking and monitoring integration
```

#### 7. GOOGLE_ANALYTICS_ID (Optional)
```
Name: GOOGLE_ANALYTICS_ID
Value: [Your GA4 Measurement ID, format: G-XXXXXXXXXX]
Description: Google Analytics tracking for website analytics
```

---

## ✅ Verification Steps

### 1. Verify Secrets Configuration

After adding all secrets, you should see:

```
Repository secrets (5-7 total):
✅ NETLIFY_AUTH_TOKEN
✅ NETLIFY_SITE_ID  
✅ NEXT_PUBLIC_API_URL
✅ NEXT_PUBLIC_APP_URL
✅ NODE_ENV
✅ SENTRY_DSN (optional)
✅ GOOGLE_ANALYTICS_ID (optional)
```

### 2. Test Deployment Pipeline

1. **Trigger a deployment** by pushing to main branch:
   ```bash
   git add .
   git commit -m "Test: Trigger deployment with new secrets"
   git push origin main
   ```

2. **Monitor GitHub Actions**:
   - Go to **"Actions"** tab in your repository
   - Watch the "DigiClick AI - Deploy with Cursor Testing" workflow
   - Verify all jobs complete successfully

### 3. Verify Deployment Success

Check that the following are working:

- ✅ **Main site**: https://digiclickai.netlify.app
- ✅ **Context-aware cursor demo**: https://digiclickai.netlify.app/cursor-context-demo
- ✅ **Portfolio page**: https://digiclickai.netlify.app/portfolio
- ✅ **Sitemap**: https://digiclickai.netlify.app/sitemap.xml
- ✅ **All 43 pages** deploy successfully
- ✅ **Custom cursor system** functions correctly

---

## 🔒 Security Best Practices

### ✅ Do's
- ✅ Use repository secrets only (never commit tokens to code)
- ✅ Rotate tokens every 90 days for security
- ✅ Use least-privilege access (only necessary permissions)
- ✅ Monitor deployment logs for any exposed secrets
- ✅ Use environment-specific secrets for staging/production

### ❌ Don'ts
- ❌ Never commit secrets to repository code
- ❌ Don't share tokens via email or chat
- ❌ Don't use the same tokens across multiple projects
- ❌ Don't store secrets in environment variables in code
- ❌ Don't use production tokens for development

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Cannot find module Scripts/generate-sitemap.js"
**Solution**: Ensure the script path fix has been committed:
```bash
git status
git add package.json
git commit -m "Fix: Update script paths to Scripts/ directory"
git push origin main
```

#### 2. "Unauthorized" Netlify Error
**Solution**: Verify NETLIFY_AUTH_TOKEN is correct:
- Check token hasn't expired
- Ensure token has deployment permissions
- Regenerate token if necessary

#### 3. "Site not found" Error
**Solution**: Verify NETLIFY_SITE_ID is correct:
- Check site ID in Netlify dashboard
- Ensure site exists and is accessible

#### 4. Build Failures
**Solution**: Check environment variables:
- Verify all required secrets are set
- Check for typos in secret names
- Ensure values don't contain extra spaces

### Getting Help

If you encounter issues:

1. **Check GitHub Actions logs** for detailed error messages
2. **Verify all secrets** are properly configured
3. **Test locally** with `npm run build` to isolate issues
4. **Check Netlify dashboard** for deployment status

---

## 📊 Expected Workflow Results

After successful configuration, each push to main branch will:

1. ✅ **Health Check**: Verify cursor system integrity
2. ✅ **Lint & Format**: Code quality checks
3. ✅ **Test Suite**: Run all tests including cursor tests
4. ✅ **Build**: Create production build with all 43 pages
5. ✅ **Deploy**: Push to Netlify with context-aware cursor system
6. ✅ **Post-Deploy Test**: Verify live site functionality
7. ✅ **Notify**: Confirm successful deployment

---

## 🎯 Success Indicators

Your deployment automation is working correctly when:

- ✅ GitHub Actions workflow completes without errors
- ✅ All 43 pages are accessible on the live site
- ✅ Context-aware cursor system functions properly
- ✅ Sitemap generates correctly with 17 pages
- ✅ Build process completes in under 5 minutes
- ✅ No module resolution errors occur

---

**🎉 Congratulations!** Your DigiClick AI deployment automation is now configured and ready for continuous deployment with the enhanced context-aware cursor system!
