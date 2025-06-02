/**
 * DigiClick AI Cursor A/B Testing Edge Function
 * Handles traffic splitting and user assignment for cursor theme variants
 */

export default async (request, context) => {
  const url = new URL(request.url);
  
  // Skip A/B testing for admin, API routes, and static assets
  const skipPaths = ['/admin', '/api', '/_next', '/favicon', '/robots.txt', '/sitemap.xml'];
  if (skipPaths.some(path => url.pathname.startsWith(path))) {
    return;
  }

  // A/B Test Configuration
  const TEST_CONFIG = {
    testId: 'cursor-theme-optimization-v1',
    isActive: true,
    variants: {
      control: { weight: 25, name: 'Current Context-Aware' },
      enhanced: { weight: 25, name: 'Enhanced Particle Trail' },
      minimal: { weight: 25, name: 'Minimalist Subtle' },
      gaming: { weight: 25, name: 'Gaming RGB Dynamic' }
    },
    duration: 30, // days
    startDate: '2024-01-15',
    sampleSize: 10000,
    excludeBots: true
  };

  // Check if test is active
  if (!TEST_CONFIG.isActive) {
    return;
  }

  // Bot detection
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /bot|crawler|spider|crawling/i.test(userAgent);
  
  if (TEST_CONFIG.excludeBots && isBot) {
    return;
  }

  // Get existing assignment from cookie
  const cookies = parseCookies(request.headers.get('cookie') || '');
  let assignment = cookies[`ab_${TEST_CONFIG.testId}`];
  
  // Generate new assignment if none exists
  if (!assignment) {
    assignment = assignUserToVariant(TEST_CONFIG.variants, request);
  }

  // Validate assignment
  if (!TEST_CONFIG.variants[assignment]) {
    assignment = 'control';
  }

  // Create response with assignment
  const response = new Response(null, {
    headers: {
      'Cache-Control': 'no-cache',
      'Set-Cookie': `ab_${TEST_CONFIG.testId}=${assignment}; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax; Secure`,
      'X-AB-Test': TEST_CONFIG.testId,
      'X-AB-Variant': assignment,
      'X-AB-Variant-Name': TEST_CONFIG.variants[assignment].name
    }
  });

  // Add analytics tracking headers
  response.headers.set('X-AB-User-ID', generateUserId(request));
  response.headers.set('X-AB-Session-ID', generateSessionId());
  response.headers.set('X-AB-Timestamp', new Date().toISOString());

  return response;
};

/**
 * Assign user to variant based on weights and consistent hashing
 */
function assignUserToVariant(variants, request) {
  const userId = generateUserId(request);
  const hash = simpleHash(userId);
  
  // Calculate cumulative weights
  const variantKeys = Object.keys(variants);
  const totalWeight = variantKeys.reduce((sum, key) => sum + variants[key].weight, 0);
  
  let cumulativeWeight = 0;
  const normalizedHash = (hash % 100) / 100; // Normalize to 0-1
  const targetWeight = normalizedHash * totalWeight;
  
  for (const key of variantKeys) {
    cumulativeWeight += variants[key].weight;
    if (targetWeight <= cumulativeWeight) {
      return key;
    }
  }
  
  return variantKeys[0]; // Fallback to first variant
}

/**
 * Generate consistent user ID based on IP and User-Agent
 */
function generateUserId(request) {
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  
  // Create a hash of IP + User-Agent for consistent assignment
  return simpleHash(ip + userAgent).toString();
}

/**
 * Generate session ID for tracking
 */
function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Simple hash function for consistent user assignment
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Parse cookies from cookie header
 */
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  
  return cookies;
}

/**
 * Configuration for Netlify Edge Functions
 */
export const config = {
  path: "/*",
  excludedPath: [
    "/admin/*",
    "/api/*", 
    "/_next/*",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    "/*.js",
    "/*.css",
    "/*.png",
    "/*.jpg",
    "/*.jpeg",
    "/*.gif",
    "/*.svg",
    "/*.webp",
    "/*.ico",
    "/*.woff",
    "/*.woff2",
    "/*.ttf",
    "/*.otf"
  ]
};
