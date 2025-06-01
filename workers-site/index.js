/**
 * Cloudflare Worker for MDTS Tech Store
 * Handles security, caching, and edge functions
 */

import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

/**
 * The DEBUG flag will do two things:
 * 1. We will skip caching on the edge, which makes it easier to debug
 * 2. We will return more detailed error messages to the client
 */
const DEBUG = false;

/**
 * List of paths that should bypass the worker
 */
const BYPASS_PATHS = [
  '/api/',
  '/_next/static/',
  '/images/',
  '/icons/',
  '/fonts/',
];

/**
 * List of paths that should be protected with additional security
 */
const PROTECTED_PATHS = [
  '/admin',
  '/api/admin',
  '/api/auth',
];

/**
 * Event handler for incoming requests
 */
addEventListener('fetch', (event) => {
  try {
    event.respondWith(handleRequest(event));
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        }),
      );
    }
    event.respondWith(new Response('Internal Error', { status: 500 }));
  }
});

/**
 * Handle the request
 * @param {FetchEvent} event - The fetch event
 * @returns {Promise<Response>} - The response
 */
async function handleRequest(event) {
  const url = new URL(event.request.url);
  const { pathname } = url;
  
  // Check if the path should bypass the worker
  if (BYPASS_PATHS.some(path => pathname.startsWith(path))) {
    return fetch(event.request);
  }
  
  // Get client IP and country
  const clientIP = event.request.headers.get('cf-connecting-ip');
  const country = event.request.cf?.country || 'XX';
  
  // Check if the request is from a bot
  const isBot = event.request.headers.get('cf-bot') === 'true';
  
  // Check if the request is to a protected path
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  
  // Apply security measures for protected paths
  if (isProtectedPath) {
    // Check if the request is from a high-risk country
    const highRiskCountries = ['CN', 'RU', 'KP', 'IR'];
    
    if (highRiskCountries.includes(country)) {
      // Log the suspicious access attempt
      // // // console.log(`Suspicious access attempt to ${pathname} from ${country} (${clientIP})`);
      
      // For admin paths, you might want to implement additional security
      if (pathname.startsWith('/admin')) {
        // You could redirect to a CAPTCHA page or implement other security measures
        // For now, we'll just add additional security headers
      }
    }
  }
  
  // Get the response from KV storage
  let response;
  
  try {
    response = await getAssetFromKV(event, {
      cacheControl: {
        bypassCache: DEBUG,
      },
    });
  } catch (e) {
    // If an error is thrown try to serve the asset at 404.html
    if (!DEBUG) {
      try {
        response = await getAssetFromKV(event, {
          mapRequestToAsset: (req) => new Request(`${new URL(req.url).origin}/404.html`, req),
        });
        
        // Return a 404 status
        response = new Response(response.body, {
          ...response,
          status: 404,
        });
      } catch (e) {}
    }
    
    // If that doesn't work, return the original error
    return new Response(e.message || e.toString(), { status: 500 });
  }
  
  // Add security headers to all responses
  response = addSecurityHeaders(response, isProtectedPath);
  
  // Add bot detection headers if needed
  if (isBot) {
    response.headers.set('X-Bot-Detection', 'true');
  }
  
  return response;
}

/**
 * Add security headers to the response
 * @param {Response} response - The original response
 * @param {boolean} isProtectedPath - Whether the path is protected
 * @returns {Response} - The response with security headers
 */
function addSecurityHeaders(response, isProtectedPath) {
  const newResponse = new Response(response.body, response);
  
  // Basic security headers for all responses
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Enhanced security for protected paths
  if (isProtectedPath) {
    newResponse.headers.set('X-Frame-Options', 'DENY');
    newResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    newResponse.headers.set('X-Security-Level', 'enhanced');
  } else {
    newResponse.headers.set('X-Frame-Options', 'SAMEORIGIN');
  }
  
  return newResponse;
}
