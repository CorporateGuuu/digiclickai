# DigiClick AI - Next.js Application

A complete Next.js application for DigiClick AI featuring custom cursor system, futuristic AI theme, and comprehensive business automation solutions.

## 🚀 Features

### Core Application
- **Next.js 14+** with App Router support
- **TypeScript** for type safety
- **Custom Cursor System** with GSAP animations
- **Particles.js** background effects
- **Responsive Design** across all devices
- **SEO Optimized** with meta tags and structured data

### Design System
- **Futuristic AI Theme** with specific color palette
  - Background: `#121212`
  - Primary Accent: `#00d4ff`
  - Secondary Accent: `#7b2cbf`
- **Typography**: Orbitron for headings, Poppins for body text
- **CSS Modules** for component-specific styling
- **Global Styles** for base styling and theme variables

### Interactive Features
- **Custom Cursor** with smooth trailing animations
- **Hover Effects** for interactive elements
- **Click Animations** and visual feedback
- **Touch Device Detection** with automatic cursor disabling
- **GSAP Scroll Animations** and page transitions
- **Smooth Scrolling** navigation

### Pages & Components
- **Homepage** with hero section and services overview
- **About Page** with mission/vision and team information
- **Contact Page** with comprehensive form integration
- **Header Component** with responsive navigation
- **Footer Component** with newsletter signup
- **Hero Component** with animated elements

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DigiclickAi.shop
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the environment variables:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=https://digiclick-ai-backend.onrender.com
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
DigiclickAi.shop/
├── components/
│   ├── CustomCursor/          # Custom cursor system
│   ├── Header/                # Navigation header
│   ├── Footer/                # Site footer
│   ├── Hero/                  # Hero section component
│   ├── ParticlesBackground/   # Particles.js integration
│   └── DigiClickLayout.js     # Main layout wrapper
├── pages/
│   ├── index.js              # Homepage
│   ├── about.tsx             # About page
│   ├── contact.tsx           # Contact page
│   └── enhanced-home.js      # Enhanced homepage example
├── styles/
│   ├── globals.css           # Global styles and theme
│   ├── Home.module.css       # Homepage styles
│   ├── About.module.css      # About page styles
│   └── Contact.module.css    # Contact page styles
├── types/
│   └── index.ts              # TypeScript type definitions
├── public/
│   └── images/               # Static images and assets
└── next.config.js            # Next.js configuration
```

## 🎨 Custom Cursor System

The custom cursor system provides enhanced user interaction with:

### Features
- **Smooth trailing animations** powered by GSAP
- **Hover effects** for interactive elements
- **Click animations** with visual feedback
- **Touch device detection** and automatic disabling
- **Customizable themes** (default, glow, minimal)

### Usage Classes
Add these classes to elements for cursor interactions:
- `cta-button` - CTA buttons with scale effects
- `nav-link` - Navigation links with hover states
- `glow-text` - Text with glow effects
- `pulse-box` - Containers with pulse animations
- `glow-trigger` - Elements that trigger cursor glow

### Integration
```jsx
import { DigiClickLayout } from '../components/Layout';

<DigiClickLayout
  showCursor={true}
  cursorTheme="default"
>
  <button className="cta-button">Click Me</button>
</DigiClickLayout>
```

## 🎭 Design System

### Color Palette
```css
:root {
  --bg-primary: #121212;
  --accent-primary: #00d4ff;
  --accent-secondary: #7b2cbf;
  --text-primary: #e0e0e0;
  --text-secondary: #b0b0b0;
}
```

### Typography
- **Headings**: Orbitron font family
- **Body Text**: Poppins font family
- **Responsive sizing** with clamp() functions

### Component Patterns
- **Gradient backgrounds** for premium feel
- **Glow effects** with box-shadow and text-shadow
- **Smooth transitions** on all interactive elements
- **Consistent spacing** using rem units

## 🔧 Configuration

### Next.js Configuration
The `next.config.js` includes:
- Image optimization settings
- Custom webpack configuration for GSAP
- Environment variable handling

### TypeScript Configuration
- Strict type checking enabled
- Path aliases for clean imports
- Custom type definitions for components

### Environment Variables
Required environment variables:
- `NEXT_PUBLIC_APP_URL` - Application URL
- `NEXT_PUBLIC_API_URL` - Backend API URL

Optional variables:
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` - Analytics tracking
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Payment processing

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Build command: `npm run build`
2. Publish directory: `out` (if using static export)
3. Set environment variables in Netlify dashboard

### Custom Server
1. Build the application: `npm run build`
2. Start the server: `npm start`
3. Ensure environment variables are set

## 🧪 Testing

### Running Tests
```bash
npm run test
# or
yarn test
```

### Testing Cursor Functionality
1. Test on desktop browsers (Chrome, Firefox, Safari)
2. Verify touch device detection on mobile
3. Check hover effects and animations
4. Validate accessibility compliance

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Mobile Optimizations
- Touch-friendly navigation
- Optimized font sizes
- Simplified animations
- Cursor system disabled on touch devices

## 🔍 SEO & Performance

### SEO Features
- Meta tags for all pages
- Open Graph tags for social sharing
- Structured data markup
- Sitemap generation

### Performance Optimizations
- Image optimization with Next.js Image component
- Lazy loading for components
- Code splitting and tree shaking
- Optimized bundle sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: hello@digiclick.ai
- Documentation: [Project Wiki]
- Issues: [GitHub Issues]

---

**DigiClick AI** - Transforming businesses with cutting-edge AI automation solutions.
