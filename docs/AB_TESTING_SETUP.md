# DigiClick AI Cursor A/B Testing Infrastructure

## 🎯 Overview

This comprehensive A/B testing framework allows testing different cursor themes, animations, and interaction patterns to optimize user engagement and conversion rates for the DigiClick AI context-aware cursor system.

---

## 🏗️ Architecture Overview

### **Netlify Edge Functions**
- **File**: `netlify/edge-functions/cursor-ab-test.js`
- **Purpose**: Traffic splitting and user assignment at the edge
- **Features**:
  - Consistent user assignment using IP + User-Agent hashing
  - Configurable traffic weights (25% per variant by default)
  - Bot detection and exclusion
  - Cookie-based persistence across sessions

### **React Context Provider**
- **File**: `src/contexts/ABTestContext.tsx`
- **Purpose**: Client-side A/B test management and analytics
- **Features**:
  - Variant configuration management
  - Event tracking and analytics integration
  - Performance monitoring
  - Error handling and fallbacks

### **Cursor Variants**
- **Control**: Current context-aware cursor system
- **Enhanced**: Particle trail effects with stronger glow
- **Minimal**: Subtle animations with faster transitions
- **Gaming**: RGB color cycling with dynamic sizing

---

## 🔧 Setup Instructions

### **1. Netlify Configuration**

Ensure your `netlify.toml` includes edge functions:

```toml
[build]
  command = "npm run build"
  publish = "out"

[[edge_functions]]
  function = "cursor-ab-test"
  path = "/*"
```

### **2. Environment Variables**

Add these to your Netlify environment variables:

```bash
# Google Analytics (optional)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
GA4_API_SECRET=your-ga4-api-secret

# Custom Analytics (optional)
CUSTOM_ANALYTICS_ENDPOINT=https://your-analytics-endpoint.com/events
ANALYTICS_API_KEY=your-analytics-api-key
```

### **3. Integration with Layout**

Update your main layout to include the A/B testing provider:

```tsx
import { ABTestProvider } from '@/contexts/ABTestContext';
import ABTestCursorManager from '@/components/cursor/ABTestCursorManager';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ABTestProvider>
          <ABTestCursorManager>
            {children}
          </ABTestCursorManager>
        </ABTestProvider>
      </body>
    </html>
  );
}
```

---

## 📊 Cursor Variants Configuration

### **Control Variant (Baseline)**
```javascript
{
  theme: 'current',
  animations: {
    hover: { scale: 1.2, duration: 0.3 },
    click: { scale: 0.9, duration: 0.1 },
    trail: false,
    particles: false,
    glow: { intensity: 0.5, color: '#00d4ff' }
  },
  performance: { targetFPS: 60, memoryLimit: 50 }
}
```

### **Enhanced Variant**
```javascript
{
  theme: 'enhanced',
  animations: {
    hover: { scale: 1.3, duration: 0.2 },
    click: { scale: 0.8, duration: 0.1 },
    trail: true,
    particles: { count: 15, lifetime: 800 },
    glow: { intensity: 0.8, color: '#00d4ff' }
  },
  performance: { targetFPS: 60, memoryLimit: 60 }
}
```

### **Minimal Variant**
```javascript
{
  theme: 'minimal',
  animations: {
    hover: { scale: 1.1, duration: 0.4 },
    click: { scale: 0.95, duration: 0.05 },
    trail: false,
    particles: false,
    glow: { intensity: 0.2, color: '#ffffff' }
  },
  performance: { targetFPS: 60, memoryLimit: 30 }
}
```

### **Gaming Variant**
```javascript
{
  theme: 'gaming',
  animations: {
    hover: { scale: 1.4, duration: 0.15 },
    click: { scale: 0.7, duration: 0.08 },
    trail: true,
    particles: { count: 25, lifetime: 1200 },
    glow: { intensity: 1.0, color: 'rainbow' },
    rgb: { enabled: true, speed: 2 }
  },
  performance: { targetFPS: 60, memoryLimit: 80 }
}
```

---

## 📈 Analytics & Tracking

### **Tracked Events**

| Event Type | Description | Properties |
|------------|-------------|------------|
| `variant_assigned` | User assigned to variant | variant, config, user_agent, screen_size |
| `cursor_interaction` | Cursor hover/click events | interaction_type, element_type, position |
| `performance_init` | Cursor system initialization | init_time, memory_used |
| `performance_fps` | Frame rate monitoring | fps, target_fps, memory_used |
| `visibility_change` | Page visibility changes | visible, touch_device |
| `error` | Cursor system errors | error_message, variant |

### **Analytics Integration**

#### **Google Analytics 4**
Events are automatically sent to GA4 with custom parameters:
- `custom_parameter_1`: Test ID
- `custom_parameter_2`: Variant name
- `custom_parameter_3`: User ID

#### **Custom Analytics API**
- **Endpoint**: `/api/analytics/ab-test`
- **Method**: POST for tracking, GET for retrieval
- **Rate Limiting**: 100 requests per minute per IP
- **Data Storage**: In-memory for development, database for production

---

## 🎛️ A/B Test Management

### **Dashboard Access**
- **URL**: `/admin/ab-test`
- **Features**:
  - Real-time variant performance comparison
  - Conversion rate and engagement metrics
  - Performance monitoring (FPS, memory usage)
  - Event filtering and analysis
  - Export functionality for detailed analysis

### **Key Metrics Tracked**

| Metric | Calculation | Purpose |
|--------|-------------|---------|
| **Conversion Rate** | (Clicks / Hovers) × 100 | Measure interaction effectiveness |
| **Engagement Score** | Total Interactions / Unique Users | Measure user engagement |
| **Performance Score** | Average FPS across sessions | Ensure 60fps standard |
| **Memory Efficiency** | Average memory usage | Prevent memory leaks |

### **Statistical Significance**
- **Minimum Sample Size**: 1000 users per variant
- **Confidence Level**: 95%
- **Test Duration**: 30 days maximum
- **Early Stopping**: Available for significant results (p < 0.01)

---

## 🔍 Testing & Validation

### **Local Testing**
```bash
# Test A/B test context
npm run test:ab-test

# Test cursor variants
npm run test:cursor-variants

# Test analytics tracking
npm run test:analytics
```

### **Performance Validation**
```bash
# Monitor FPS across variants
npm run monitor:performance

# Check memory usage
npm run monitor:memory

# Validate Core Web Vitals
npm run test:web-vitals
```

### **Manual Testing Checklist**
- [ ] Variant assignment works consistently
- [ ] All cursor variants render correctly
- [ ] Touch device detection works
- [ ] Analytics events are tracked
- [ ] Performance stays above 60fps
- [ ] Memory usage within limits
- [ ] Error handling works properly

---

## 🚨 Troubleshooting

### **Common Issues**

#### **Variant Not Assigned**
```bash
# Check edge function logs
netlify functions:log cursor-ab-test

# Verify cookie setting
document.cookie // Should contain ab_cursor-theme-optimization-v1
```

#### **Analytics Not Tracking**
```bash
# Check API endpoint
curl -X POST /api/analytics/ab-test \
  -H "Content-Type: application/json" \
  -d '{"event":"test","testId":"test","variant":"control"}'

# Verify GA4 configuration
console.log(window.gtag) // Should be defined
```

#### **Performance Issues**
```bash
# Monitor frame rate
const fps = new FPSMeter();
fps.start();

# Check memory usage
console.log(performance.memory);
```

---

## 📊 Success Metrics

### **Primary KPIs**
- **User Engagement**: Time on site, page views, scroll depth
- **Conversion Rate**: Contact form submissions, demo requests
- **Performance**: 60fps maintenance, memory efficiency
- **User Experience**: Reduced bounce rate, increased interactions

### **Secondary Metrics**
- **Technical Performance**: Core Web Vitals compliance
- **Accessibility**: Screen reader compatibility
- **Cross-Device**: Touch device detection accuracy
- **Error Rate**: Cursor system stability

---

## 🔄 Test Lifecycle

### **Phase 1: Setup (Days 1-3)**
- Configure variants and traffic splitting
- Implement tracking and analytics
- Validate technical implementation
- Begin data collection

### **Phase 2: Data Collection (Days 4-25)**
- Monitor performance metrics
- Track user interactions
- Ensure statistical significance
- Address any technical issues

### **Phase 3: Analysis (Days 26-30)**
- Analyze conversion rates and engagement
- Evaluate performance impact
- Determine winning variant
- Plan implementation strategy

### **Phase 4: Implementation (Days 31+)**
- Deploy winning variant to 100% traffic
- Monitor for any issues
- Document learnings and insights
- Plan next iteration of testing

---

## 🎯 Expected Outcomes

### **Performance Targets**
- **Engagement Increase**: 15-25% improvement in user interactions
- **Conversion Lift**: 10-20% increase in form submissions
- **Performance Maintenance**: 60fps across all variants
- **Memory Efficiency**: <50MB average usage

### **Learning Objectives**
- Optimal cursor animation intensity
- Best particle effects configuration
- Ideal hover response timing
- Most engaging visual feedback

---

**🚀 Your DigiClick AI cursor system now has comprehensive A/B testing capabilities for data-driven optimization!**
