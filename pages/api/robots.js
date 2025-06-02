// DigiClick AI - Dynamic Robots.txt API
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://digiclickai.netlify.app';
    const isProduction = process.env.NODE_ENV === 'production';
    
    let robotsTxt = '';

    if (isProduction) {
      // Production robots.txt - allow all crawlers
      robotsTxt = `# DigiClick AI - Enhanced Cursor System
# Production robots.txt

User-agent: *
Allow: /

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay for respectful crawling
Crawl-delay: 1

# Specific rules for major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 2

# Block access to sensitive areas
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /private/
Disallow: /.well-known/

# Allow access to important pages
Allow: /cursor-demo
Allow: /portfolio
Allow: /contact
Allow: /about
Allow: /pricing

# Block common bot patterns
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

# Allow social media crawlers
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

# Performance optimization
# Cache directive for robots.txt
# Cache-Control: public, max-age=86400`;
    } else {
      // Development/staging robots.txt - block all crawlers
      robotsTxt = `# DigiClick AI - Enhanced Cursor System
# Development/Staging robots.txt

User-agent: *
Disallow: /

# This is a development/staging environment
# Please visit our production site at: https://digiclickai.netlify.app

Sitemap: ${baseUrl}/sitemap.xml`;
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    return res.status(200).send(robotsTxt);
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    return res.status(500).send('# Error generating robots.txt');
  }
}
