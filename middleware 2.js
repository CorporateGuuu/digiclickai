import { NextResponse } from &apos;next/server';

export function middleware(request) {
  // Get the visitor's IP address from Cloudflare headers
  const ip = request.headers.get('cf-connecting-ip') || 
             request.headers.get('x-forwarded-for') || 
             request.ip || 
             &apos;unknown';
  
  // Get Cloudflare country code
  const country = request.headers.get('cf-ipcountry') || &apos;unknown';
  
  // Get Cloudflare threat score (if available)
  const threatScore = request.headers.get('cf-threat-score') || &apos;0';
  
  // Get Cloudflare bot detection (if available)
  const bot = request.headers.get('cf-bot') || &apos;unknown';
  
  // Get Cloudflare Worker metadata (if available)
  const worker = request.headers.get('cf-worker') || &apos;unknown';
  
  // Get the request path
  const path = request.nextUrl.pathname;
  
  // Log the request for monitoring (in production, you'd send this to a logging service)
  // // console.log(`Request: ${path} | IP: ${ip} | Country: ${country} | Threat: ${threatScore} | Bot: ${bot}`);
  
  // Check if the request is from a high-risk country (example)
  const highRiskCountries = ['CN', &apos;RU', &apos;KP', &apos;IR'];
  
  // Check if the request is to a sensitive path
  const sensitivePaths = ['/admin', '/api/admin', '/api/auth'];
  
  // Enhanced security for sensitive paths
  if (sensitivePaths.some(prefix => path.startsWith(prefix))) {
    // If from a high-risk country and accessing sensitive paths, add additional security headers
    if (highRiskCountries.includes(country)) {
      const response = NextResponse.next();
      
      // Add security headers
      response.headers.set('X-Content-Type-Options', &apos;nosniff');
      response.headers.set('X-Frame-Options', &apos;DENY');
      response.headers.set('X-XSS-Protection', &apos;1; mode=block');
      response.headers.set('Referrer-Policy', &apos;strict-origin-when-cross-origin');
      response.headers.set('Permissions-Policy', &apos;camera=(), microphone=(), geolocation=()');
      
      // Add custom header for internal tracking
      response.headers.set('X-Security-Level', &apos;enhanced');
      
      return response;
    }
  }
  
  // Check if the threat score is high (Cloudflare scores range from 0-100, higher is riskier)
  if (parseInt(threatScore) > 50) {
    // For high threat scores, you might want to block or challenge the request
    // In this example, we'll just add security headers
    const response = NextResponse.next();
    response.headers.set('X-Security-Level', &apos;high-threat');
    return response;
  }
  
  // Add basic security headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', &apos;nosniff');
  response.headers.set('X-Frame-Options', &apos;SAMEORIGIN');
  response.headers.set('X-XSS-Protection', &apos;1; mode=block');
  
  return response;
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    // Apply to all routes except static files, images, and other assets
    '/((?!_next/static|_next/image|favicon.ico|images|icons|fonts).*)',
  ],
};
