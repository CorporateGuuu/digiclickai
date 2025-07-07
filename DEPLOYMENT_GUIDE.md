# DigiClick AI - GitHub Pages Deployment Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install gsap
npm install # Install all other dependencies if not already done
```

### 2. Development Setup
```bash
npm run dev
```
Navigate to `http://localhost:3000` to test the custom cursor functionality.

## 🌐 GitHub Pages Deployment Architecture

The DigiClick AI website uses a simplified deployment architecture:
- **Source**: GitHub repository (main branch)
- **Build**: GitHub Actions with Next.js static export
- **Hosting**: GitHub Pages with custom domain
- **Domain**: digiclickai.com (CNAME configured)
- **SSL**: Automatic HTTPS via GitHub Pages

## 🎯 Custom Cursor Integration (Already Implemented)

Since the CustomCursor component is integrated into the Layout component in `components/Layout.js`, it automatically applies to all pages in your DigiClick AI application.

### Architecture Overview:
```
pages/_app.js
├── Layout Component
    ├── CustomCursor Component
    ├── Error Boundaries
    └── Performance Monitoring
```

## 🎨 Enhance Existing Pages with Cursor Interactions

Add the following CSS classes to elements across your pages to leverage the custom cursor effects:

### **For Buttons and CTAs:**
```jsx
<button className="cta-button pulse-box">Get Started</button>
<a href="/demo" className="cta-button">Try Demo</a>
<button className="cta-button glow-trigger">Special Action</button>
```

### **For Navigation Links:**
```jsx
<nav>
  <a href="/about" className="nav-link">About Us</a>
  <a href="/services" className="nav-link">Services</a>
  <a href="/contact" className="nav-link">Contact</a>
</nav>
```

### **For Headings and Special Text:**
```jsx
<h1 className="glow-text">DigiClick AI</h1>
<h2 className="interactive-text">Hover over this heading</h2>
<p className="interactive-text">Interactive paragraph text</p>
```

### **For Special Interactive Zones:**
```jsx
<section className="glow-trigger">
  <div className="pulse-box">Enhanced cursor effects in this area</div>
  <div className="feature-card glow-trigger pulse-box">
    <h3>Combined Effects</h3>
    <p>Multiple cursor enhancements</p>
  </div>
</section>
```

### **For Forms:**
```jsx
<form className="contact-form">
  <input type="text" className="form-input" placeholder="Name" />
  <textarea className="form-input" placeholder="Message"></textarea>
  <button type="submit" className="cta-button pulse-box">Send Message</button>
</form>
```

## 🎛️ Page-Specific Cursor Customization

### Method 1: CSS Customization
Modify `components/CustomCursor/CustomCursor.module.css`:

```css
/* Page-specific cursor styles */
.cursor.homepage {
  /* Custom styles for homepage */
  --cursor-primary-color: #00d4ff;
  --cursor-secondary-color: #7b2cbf;
}

.cursor.about {
  /* Custom styles for about page */
  --cursor-primary-color: #00ff88;
  --cursor-secondary-color: #ff6b6b;
}

.cursor.corporate {
  /* Corporate theme */
  --cursor-primary-color: #0066cc;
  --cursor-secondary-color: #003d7a;
}
```

### Method 2: Layout Props
Apply page-specific themes in your Layout:
```jsx
// Homepage
<Layout cursorTheme="default" className="homepage">
  {children}
</Layout>

// About page
<Layout cursorTheme="minimal" className="about">
  {children}
</Layout>

// Corporate pages
<Layout cursorTheme="corporate" className="corporate">
  {children}
</Layout>
```

### Method 3: Dynamic Theme Switching
```jsx
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function MyPage() {
  const [cursorTheme, setCursorTheme] = useState('default');

  useEffect(() => {
    // Change theme based on time of day, user preference, etc.
    const hour = new Date().getHours();
    if (hour >= 18 || hour <= 6) {
      setCursorTheme('neon');
    }
  }, []);

  return (
    <Layout cursorTheme={cursorTheme}>
      {/* Page content */}
    </Layout>
  );
}
```

## 🧪 Test Cursor Interactions

Visit these pages to test cursor functionality:

### **Core Pages:**
- `/` - Homepage with enhanced hero section
- `/about` - About page with team interactions
- `/services` - Services with interactive cards
- `/contact` - Contact form with cursor feedback

### **Demo Pages:**
- `/cursor-demo` - Comprehensive cursor demonstration
- `/enhanced-demo` - Your original CSS enhanced with cursor effects

### **Authentication:**
- `/login` - Login page with form interactions
- `/signup` - Registration with enhanced forms

### **Dashboard:**
- `/dashboard` - Protected dashboard with analytics

## 🚀 GitHub Pages Deployment

### **Automated Deployment (Recommended):**
The site automatically deploys on every push to the main branch:

```bash
# Make your changes
git add .
git commit -m "Update website content"
git push origin main

# GitHub Actions automatically:
# 1. Builds Next.js static export (npm run build)
# 2. Uploads to GitHub Pages
# 3. Deploys to https://digiclickai.com
```

### **Manual Build and Test:**
```bash
# Build static export locally
npm run build

# Test the build
npx serve out

# The 'out' directory contains the static files
# that get deployed to GitHub Pages
```

### **Deployment Workflow:**
The `.github/workflows/simple-deploy.yml` file handles:
- Node.js 18 setup
- Dependency installation
- Next.js build with static export
- GitHub Pages deployment
- Custom domain configuration

## 🔧 Environment Variables

### **Production Variables (GitHub Pages):**
```env
# Backend API
NEXT_PUBLIC_API_URL=https://digiclickai-backend.onrender.com

# Frontend Domain (Custom Domain)
NEXT_PUBLIC_APP_URL=https://digiclickai.com

# Optional: Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Optional: Cursor Performance
NEXT_PUBLIC_CURSOR_PERFORMANCE_MODE=high
NEXT_PUBLIC_CURSOR_TRAIL_LENGTH=20
```

### **Development Variables:**
```env
# Development
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **GitHub Pages Configuration:**
- **Repository**: CorporateGuuu/digiclickai
- **Branch**: main (source)
- **Build Command**: npm run build
- **Output Directory**: out/
- **Custom Domain**: digiclickai.com (via CNAME file)

## 📊 SEO and Search Console Setup

### **1. Sitemap Generation:**
Ensure your sitemap is generated at `https://your-domain.com/sitemap.xml`

### **2. Google Search Console:**
1. Submit your sitemap to Google Search Console
2. Verify your domain ownership
3. Monitor indexing status and performance metrics

### **3. Meta Tags Verification:**
Check that all pages have proper meta tags:
```jsx
<Head>
  <title>Page Title - DigiClick AI</title>
  <meta name="description" content="Page description" />
  <meta property="og:title" content="Page Title" />
  <meta property="og:description" content="Page description" />
  <meta property="og:image" content="/images/og-image.jpg" />
</Head>
```

## ⚡ Performance Optimization

### **Automatic Optimizations:**
- ✅ Custom cursor automatically disables on touch devices
- ✅ GSAP animations are GPU-accelerated for 60fps performance
- ✅ Particle trails are automatically cleaned up to prevent memory leaks
- ✅ RequestAnimationFrame used for smooth animations
- ✅ Error boundaries prevent cursor crashes from affecting the app

### **Manual Optimizations:**
```jsx
// Disable cursor on specific pages if needed
<Layout showCursor={false}>
  {children}
</Layout>

// Reduce particle trail length for better performance
<Layout cursorTheme="minimal">
  {children}
</Layout>

// Enable performance monitoring
<Layout cursorTheme="default" performanceMode="high">
  {children}
</Layout>
```

## 🔍 Troubleshooting

### **Common Issues:**

#### **Cursor doesn't appear:**
1. Check browser console for JavaScript errors
2. Verify GSAP is loaded: `window.gsap` should be available
3. Check if touch device detection is working correctly
4. Ensure Layout component is properly wrapping your content

#### **Animations are choppy:**
1. Ensure GSAP is loaded before CustomCursor component
2. Check if too many particles are being rendered
3. Verify GPU acceleration is enabled
4. Test on different devices and browsers

#### **Mobile performance issues:**
1. Verify touch device detection is working (cursor should be hidden)
2. Check if animations are disabled on mobile
3. Test on actual mobile devices, not just browser dev tools

#### **Cursor interactions not working:**
1. Verify CSS classes are applied correctly
2. Check if elements have `cursor: none` style
3. Ensure Layout component is using the correct cursor theme
4. Test with different cursor themes

### **Debug Mode:**
Enable debug mode for troubleshooting:
```jsx
<Layout cursorTheme="default" debug={true}>
  {children}
</Layout>
```

## 📱 Mobile Considerations

### **Automatic Handling:**
- Cursor automatically hides on touch devices
- Hover effects are preserved for desktop
- Touch interactions work normally
- Performance is optimized for mobile

### **Manual Mobile Optimization:**
```css
/* Mobile-specific styles */
@media (hover: none) and (pointer: coarse) {
  .custom-cursor {
    display: none !important;
  }
  
  .cta-button:active {
    transform: scale(0.95);
  }
}
```

## 🎯 Best Practices

### **1. Class Usage:**
- Use consistent class names across similar elements
- Combine classes for enhanced effects: `pulse-box glow-trigger`
- Test all interactive elements for proper cursor feedback

### **2. Performance:**
- Limit glow triggers to important sections
- Use CSS modules for scoped styling
- Test on various devices for optimal performance

### **3. Accessibility:**
- Maintain proper focus states for keyboard navigation
- Ensure cursor doesn't interfere with screen readers
- Provide fallbacks for users with motion sensitivity

### **4. Testing:**
- Test on multiple browsers and devices
- Verify cursor interactions work as expected
- Check performance metrics regularly

## 🔄 Continuous Integration

### **GitHub Actions Configuration:**
The current deployment workflow (`.github/workflows/simple-deploy.yml`):

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build with Next.js
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4
        with:
          static_site_generator: next
          enablement: true

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## 🔧 Custom Domain Setup (GitHub Pages)

### **DNS Configuration:**
To use digiclickai.com with GitHub Pages:

1. **Add CNAME file** (already done):
   ```
   digiclickai.com
   ```

2. **Configure DNS records** in your domain provider:
   - **Remove existing A records**
   - **Add CNAME record**:
     - Name: `@` (or blank for root domain)
     - Value: `corporateguuu.github.io`
     - TTL: 300 (5 minutes)

3. **Alternative for root domains** (if CNAME not supported):
   ```
   A records:
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

### **Verification:**
```bash
# Check DNS propagation
dig CNAME digiclickai.com

# Test site
curl -I https://digiclickai.com

# Verify HTTPS
curl -I https://digiclickai.com | grep -i "strict-transport-security"
```

### **GitHub Pages Settings:**
- **Source**: Deploy from a branch
- **Branch**: main / (root)
- **Custom domain**: digiclickai.com
- **Enforce HTTPS**: ✅ Enabled (automatic after DNS propagation)

## 📊 Deployment Status

### **Current Architecture:**
- ✅ **GitHub Repository**: CorporateGuuu/digiclickai
- ✅ **GitHub Actions**: Automated build and deploy
- ✅ **GitHub Pages**: Static hosting with custom domain
- ✅ **CNAME Configuration**: digiclickai.com → corporateguuu.github.io
- ⏳ **DNS Migration**: Pending user DNS configuration
- ⏳ **HTTPS Certificate**: Will be automatic after DNS update

### **Migration Benefits:**
- **Simplified Architecture**: Single platform (GitHub)
- **No External Dependencies**: No Netlify/Vercel secrets required
- **Reliable Hosting**: GitHub's infrastructure
- **Automatic SSL**: Free HTTPS certificates
- **Version Control Integration**: Direct deployment from repository

This comprehensive guide ensures successful deployment and optimal performance of your DigiClick AI system on GitHub Pages.
