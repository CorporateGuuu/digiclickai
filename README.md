# DigiClick AI - Premium AI Automation Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/digiclick-ai)
[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/your-site/deploys)

> **Transform your business with cutting-edge AI automation solutions featuring an immersive custom cursor experience.**

## 🎯 Features

### 🖱️ **Custom Cursor System**
- **Particle Trail Effects** - Smooth, velocity-based particle trails
- **Smart State Detection** - Automatically adapts to different content types
- **Interactive Feedback** - Visual feedback for buttons, links, and special zones
- **Performance Optimized** - 60fps animations with GPU acceleration
- **Mobile Responsive** - Automatically hides on touch devices
- **Accessibility Compliant** - Respects reduced motion preferences

### 🎨 **DigiClick AI Theme**
- **Futuristic Design** - Dark theme with neon accents (#00d4ff, #7b2cbf)
- **Orbitron/Poppins Fonts** - Professional typography system
- **GSAP Animations** - Smooth, professional animations throughout
- **Gradient Effects** - Dynamic gradients and glow effects
- **Responsive Design** - Mobile-first approach with touch optimization

### 🚀 **Core Functionality**
- **AI Services Showcase** - Dynamic service loading from backend API
- **Contact Forms** - Enhanced forms with cursor interactions
- **Authentication System** - JWT-based login/signup with protected routes
- **Portfolio Display** - Dynamic portfolio loading with animations
- **Analytics Integration** - Google Analytics and performance monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/digiclick-ai.git
cd digiclick-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application with custom cursor functionality.

### 🎮 Test Cursor Interactions

```bash
# Check cursor system health
npm run check:cursor

# Visit cursor demo page
npm run cursor:demo
# Then go to: http://localhost:3000/cursor-demo
```

## 🎨 Custom Cursor Usage

### Basic Implementation
```jsx
import { DigiClickLayout } from '../components/Layout';

export default function MyPage() {
  return (
    <DigiClickLayout showCursor={true} cursorTheme="default">
      <section className="hero glow-trigger">
        <h1 className="glow-text">Welcome to DigiClick AI</h1>
        <p>Experience the future of AI automation</p>
        <button className="cta-button pulse-box">Get Started</button>
      </section>
    </DigiClickLayout>
  );
}
```

### Available CSS Classes
- **`.cta-button`** - Enhanced buttons with cursor interactions
- **`.glow-text`** - Gradient text with glow effects
- **`.nav-link`** - Navigation links with hover animations
- **`.pulse-box`** - Pulsing containers for special content
- **`.glow-trigger`** - Zones that trigger enhanced cursor glow

### Cursor States
1. **Default** - Blue glow with particle trails
2. **Pointer** - Green accent with "CLICK" label (buttons, links)
3. **Glow** - Purple enhanced glow (special zones)
4. **Text** - Red accent (headings, text elements)
5. **Click** - White flash with expanding ripples

## 🏗️ Project Structure

```
digiclick-ai/
├── components/
│   ├── CustomCursor/
│   │   ├── CustomCursor.js          # Main cursor component
│   │   ├── CustomCursor.module.css  # Cursor styles
│   │   └── index.js                 # Export file
│   ├── Layout.js                    # Layout with cursor integration
│   ├── AuthModal.js                 # Authentication modal
│   ├── Portfolio.js                 # Portfolio component
│   └── Chatbot/                     # Chatbot system
├── hooks/
│   └── useMousePosition.js          # Mouse tracking hook
├── pages/
│   ├── index.js                     # Homepage with cursor
│   ├── cursor-demo.js               # Cursor demonstration
│   ├── enhanced-demo.js             # Enhanced CSS demo
│   └── _app.js                      # App with Layout integration
├── styles/
│   ├── globals.css                  # Global styles with cursor classes
│   ├── Home.module.css              # Enhanced homepage styles
│   └── cursor-integration-guide.md  # CSS integration guide
├── scripts/
│   ├── deploy.js                    # Automated deployment
│   ├── check-cursor.js              # Health check script
│   └── package-scripts.json        # NPM scripts reference
├── tests/
│   └── cursor.test.js               # Cursor functionality tests
└── docs/
    └── DEPLOYMENT_GUIDE.md          # Comprehensive deployment guide
```

## 🚀 Deployment

### Quick Deploy to Vercel
```bash
# Deploy with automated checks
npm run deploy

# Or deploy to specific platform
npm run deploy:vercel
npm run deploy:netlify
```

### Manual Deployment
```bash
# Build the application
npm run build

# Deploy to your preferred platform
# See DEPLOYMENT_GUIDE.md for detailed instructions
```

### Environment Variables
```env
# Required
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_CURSOR_PERFORMANCE_MODE=high
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Test cursor functionality specifically
npm run test:cursor

# Check system health
npm run check:cursor

# Performance testing
npm run performance:test
```

## 📱 Browser Support

- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Cursor Features**: Desktop only (automatically hidden on touch devices)

## 🎯 Performance

- **60fps animations** with GPU acceleration
- **Automatic cleanup** prevents memory leaks
- **Touch device optimization** with cursor hiding
- **Reduced motion support** for accessibility
- **Lazy loading** for optimal performance

## 🔧 Development

### Adding New Cursor Interactions
```jsx
// Add cursor classes to elements
<div className="my-element glow-trigger pulse-box">
  <h3 className="glow-text">Interactive Content</h3>
  <button className="cta-button">Action Button</button>
</div>
```

### Custom Cursor Themes
```jsx
// Use different cursor themes
<Layout cursorTheme="neon">        // Neon theme
<Layout cursorTheme="minimal">     // Minimal theme
<Layout cursorTheme="corporate">   // Corporate theme
```

### Performance Monitoring
```jsx
// Enable debug mode
<Layout showCursor={true} debug={true}>
  {children}
</Layout>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/cursor-enhancement`
3. Run tests: `npm run test:cursor`
4. Commit changes: `git commit -m 'Add cursor enhancement'`
5. Push to branch: `git push origin feature/cursor-enhancement`
6. Submit a pull request

### Development Workflow
- All cursor changes must pass `npm run test:cursor`
- Health check must score 90%+ with `npm run check:cursor`
- Test on multiple devices and browsers
- Verify accessibility compliance

## 📚 Documentation

- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[Cursor Integration Guide](styles/cursor-integration-guide.md)** - CSS integration examples
- **[Component Documentation](docs/COMPONENTS.md)** - Component usage guide

## 🎨 Design System

### Colors
- **Primary Background**: `#121212`
- **Primary Accent**: `#00d4ff` (Cyan blue)
- **Secondary Accent**: `#7b2cbf` (Purple)
- **Text**: `#e0e0e0` (Light gray)

### Typography
- **Headers**: Orbitron (futuristic, tech-focused)
- **Body**: Poppins (clean, readable)
- **Code**: Courier New (monospace)

### Cursor Colors
- **Default**: `#00d4ff` (Blue glow)
- **Pointer**: `#00ff88` (Green accent)
- **Glow**: `#7b2cbf` (Purple glow)
- **Text**: `#ff6b6b` (Red accent)
- **Click**: `#ffffff` (White flash)

## 🔗 Links

- **Live Demo**: [https://digiclick-ai.vercel.app](https://digiclick-ai.vercel.app)
- **Cursor Demo**: [https://digiclick-ai.vercel.app/cursor-demo](https://digiclick-ai.vercel.app/cursor-demo)
- **Backend API**: [https://digiclick-ai-backend.onrender.com](https://digiclick-ai-backend.onrender.com)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **GSAP** - Animation library powering smooth cursor effects
- **Next.js** - React framework for optimal performance
- **Vercel** - Deployment platform for seamless hosting
- **DigiClick AI Team** - For the vision and design direction

---

**Built with ❤️ by the DigiClick AI team**

*Experience the future of AI automation with immersive cursor interactions.*
