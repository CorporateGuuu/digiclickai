import { NextResponse } from 'next/server';

// Define cache durations for different asset types
const CACHE_DURATIONS = {
  // Images - cache for 30 days
  images: 60 * 60 * 24 * 30, // 30 days in seconds
  // Fonts - cache for 1 year
  fonts: 60 * 60 * 24 * 365, // 1 year in seconds
  // CSS and JS - cache for 7 days
  css: 60 * 60 * 24 * 7, // 7 days in seconds
  js: 60 * 60 * 24 * 7, // 7 days in seconds
  // Default - cache for 1 day
  default: 60 * 60 * 24, // 1 day in seconds
};

// Function to determine asset type from path
function getAssetType(path) {
  if (/\.(jpe?g|png|gif|svg|webp|avif)$/i.test(path)) {
    return 'images';
  }
  if (/\.(woff2?|eot|ttf|otf)$/i.test(path)) {
    return 'fonts';
  }
  if (/\.css$/i.test(path)) {
    return 'css';
  }
  if (/\.js$/i.test(path)) {
    return 'js';
  }
  return 'default';
}

export function middleware(request) {
  // Get the visitor's IP address from Cloudflare headers
  const ip = request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for') ||
    request.ip ||
    'unknown';

  // Get Cloudflare country code
  const country = request.headers.get('cf-ipcountry') || 'unknown';

  // Get Cloudflare threat score (if available)
  const threatScore = request.headers.get('cf-threat-score') || '0';

  // Get Cloudflare bot detection (if available)
  const bot = request.headers.get('cf-bot') || 'unknown';

  // Get Cloudflare Worker metadata (if available)
  const worker = request.headers.get('cf-worker') || 'unknown';

  // Get the request path
  const path = request.nextUrl.pathname;

  // Apply caching headers for static assets
  if (
    path.startsWith('/_next/') ||
    path.startsWith('/images/') ||
    path.startsWith('/fonts/') ||
    path.startsWith('/assets/')
  ) {
    const assetType = getAssetType(path);
    const maxAge = CACHE_DURATIONS[assetType];

    // Create a new response with caching headers
    const response = NextResponse.next();

    // Set caching headers
    response.headers.set(
      'Cache-Control',
      `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 0.5}`
    );

    // Add Vary header for proper caching
    response.headers.set('Vary', 'Accept-Encoding');

    // Add basic security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');

    return response;
  }

  // Log the request for monitoring (in production, you'd send this to a logging service)
  // // console.log(`Request: ${path} | IP: ${ip} | Country: ${country} | Threat: ${threatScore} | Bot: ${bot}`);

  // Check if the request is from a high-risk country (example)
  const highRiskCountries = ['CN', 'RU', 'KP', 'IR'];

  // Check if the request is to a sensitive path
  const sensitivePaths = ['/admin', '/api/admin', '/api/auth'];

  // Enhanced security for sensitive paths
  if (sensitivePaths.some(prefix => path.startsWith(prefix))) {
    // If from a high-risk country and accessing sensitive paths, add additional security headers
    if (highRiskCountries.includes(country)) {
      const response = NextResponse.next();

      // Add security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

      // Add custom header for internal tracking
      response.headers.set('X-Security-Level', 'enhanced');

      return response;
    }
  }

  // Check if the threat score is high (Cloudflare scores range from 0-100, higher is riskier)
  if (parseInt(threatScore) > 50) {
    // For high threat scores, you might want to block or challenge the request
    // In this example, we'll just add security headers
    const response = NextResponse.next();
    response.headers.set('X-Security-Level', 'high-threat');
    return response;
  }

  // Add basic security headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    // Apply to all routes
    '/:path*',
    // Include static assets for caching
    '/_next/static/:path*',
    '/images/:path*',
    '/fonts/:path*',
    '/assets/:path*',
  ],
};
