# DigiClick AI Layout Components

This directory contains various layout components for the DigiClick AI application, each designed for different use cases and levels of functionality.

## Available Layout Components

### 1. `Layout.js` - Simple Layout with Custom Cursor
**Best for:** Most pages that need the custom cursor without heavy theming

```jsx
import Layout from '../components/Layout';

export default function MyPage() {
  return (
    <Layout showCursor={true} cursorTheme="default">
      <h1>My Page Content</h1>
    </Layout>
  );
}
```

**Props:**
- `showCursor` (boolean, default: true) - Show/hide custom cursor
- `cursorTheme` (string, default: 'default') - Cursor theme ('default', 'minimal', 'neon', 'corporate')
- `className` (string) - Additional CSS classes

### 2. `DigiClickLayout` - Full DigiClick AI Theme Layout
**Best for:** Landing pages, marketing pages, and pages that need the full AI theme

```jsx
import { DigiClickLayout } from '../components/Layout';

export default function HomePage() {
  return (
    <DigiClickLayout 
      showCursor={true} 
      showParticles={true}
      cursorTheme="default"
    >
      <h1 className="glow-text">Welcome to DigiClick AI</h1>
      <button className="cta-button">Get Started</button>
    </DigiClickLayout>
  );
}
```

**Props:**
- `showCursor` (boolean, default: true) - Show/hide custom cursor
- `showParticles` (boolean, default: false) - Show/hide particles background
- `cursorTheme` (string, default: 'default') - Cursor theme
- `className` (string) - Additional CSS classes

**Includes:**
- DigiClick AI color scheme (#121212, #00d4ff, #7b2cbf)
- Orbitron/Poppins fonts
- Pre-styled components (.cta-button, .glow-text, .pulse-box)
- Gradient backgrounds
- Particle effects (optional)

### 3. `MinimalLayout` - Minimal Layout
**Best for:** Admin pages, forms, or pages that need minimal styling

```jsx
import { MinimalLayout } from '../components/Layout';

export default function AdminPage() {
  return (
    <MinimalLayout showCursor={true}>
      <h1>Admin Dashboard</h1>
    </MinimalLayout>
  );
}
```

**Props:**
- `showCursor` (boolean, default: true) - Show/hide custom cursor

### 4. `DigiClickLayout.js` - Full-Featured Layout
**Best for:** Complex pages that need SEO, analytics, and all features

```jsx
import DigiClickLayout from '../components/DigiClickLayout';

export default function LandingPage() {
  return (
    <DigiClickLayout
      title="AI Automation Solutions"
      description="Transform your business with AI"
      showParticles={true}
      showCursor={true}
      showChatbot={true}
      cursorTheme="default"
    >
      <h1>Landing Page Content</h1>
    </DigiClickLayout>
  );
}
```

**Props:**
- `title` (string) - Page title for SEO
- `description` (string) - Page description for SEO
- `showParticles` (boolean, default: true) - Show/hide particles
- `showCursor` (boolean, default: true) - Show/hide custom cursor
- `showChatbot` (boolean, default: true) - Show/hide chatbot
- `className` (string) - Additional CSS classes
- `cursorTheme` (string, default: 'default') - Cursor theme

**Includes:**
- Full SEO optimization
- Google Analytics integration
- Structured data
- Error boundaries
- Accessibility features
- Performance optimizations

## Cursor Themes

### Available Themes:
1. **default** - DigiClick AI blue/purple theme
2. **minimal** - Clean white/blue theme
3. **neon** - Vibrant pink/green cyberpunk
4. **corporate** - Professional blue theme

### Usage:
```jsx
<Layout cursorTheme="neon">
  {/* Your content */}
</Layout>
```

## Pre-styled Components

When using `DigiClickLayout`, these classes are automatically available:

### Buttons
```jsx
<button className="cta-button">Primary Button</button>
```

### Text Effects
```jsx
<h1 className="glow-text">Glowing Text</h1>
```

### Animated Boxes
```jsx
<div className="pulse-box">Pulsing Container</div>
```

## Global Layout (_app.js)

The main layout is configured in `_app.js`:

```jsx
import Layout from '../components/Layout';

function AppContent({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Layout showCursor={true} cursorTheme="default">
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
```

## Performance Considerations

### Optimizations Included:
- GPU acceleration with `translate3d`
- Error boundaries for graceful failures
- Lazy loading for heavy components
- Reduced motion support for accessibility
- Touch device detection
- Memory cleanup for animations

### Best Practices:
1. Use `Layout` for most pages
2. Use `DigiClickLayout` for marketing/landing pages
3. Use `MinimalLayout` for admin/utility pages
4. Use `DigiClickLayout.js` for SEO-critical pages

## Accessibility Features

All layouts include:
- Skip navigation links
- Focus management
- Reduced motion support
- High contrast mode support
- Screen reader compatibility
- Keyboard navigation support

## Mobile Optimization

- Touch device detection
- Responsive design
- Performance optimizations
- Overflow handling
- Touch-friendly interactions

## Error Handling

All layouts include error boundaries that:
- Gracefully handle component failures
- Provide fallback UI
- Log errors for debugging
- Maintain app stability

## Customization

### Adding Custom Styles:
```jsx
<Layout className="my-custom-class">
  {/* Your content */}
</Layout>
```

### Disabling Features:
```jsx
<Layout showCursor={false}>
  {/* Page without cursor */}
</Layout>
```

### Custom Cursor Theme:
```jsx
<Layout cursorTheme="corporate">
  {/* Page with corporate cursor */}
</Layout>
```

## Migration Guide

### From Direct CustomCursor Usage:
```jsx
// Before
<>
  <CustomCursor />
  <main>{children}</main>
</>

// After
<Layout>
  {children}
</Layout>
```

### From Basic Layout:
```jsx
// Before
<div className="layout">
  {children}
</div>

// After
<Layout className="layout">
  {children}
</Layout>
```

This provides a clean, scalable approach to layout management while maintaining the custom cursor functionality you want throughout your application.
