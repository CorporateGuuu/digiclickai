// DigiClick AI - Dynamic Sitemap API
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://digiclickai.netlify.app';
    
    // DigiClick AI pages with priorities and change frequencies
    const pages = [
      { url: '', priority: '1.0', changefreq: 'daily', lastmod: new Date().toISOString() },
      { url: 'portfolio', priority: '0.9', changefreq: 'weekly', lastmod: new Date().toISOString() },
      { url: 'about', priority: '0.8', changefreq: 'monthly', lastmod: new Date().toISOString() },
      { url: 'contact', priority: '0.8', changefreq: 'monthly', lastmod: new Date().toISOString() },
      { url: 'pricing', priority: '0.8', changefreq: 'weekly', lastmod: new Date().toISOString() },
      { url: 'cursor-demo', priority: '0.7', changefreq: 'monthly', lastmod: new Date().toISOString() },
      { url: 'blog', priority: '0.7', changefreq: 'weekly', lastmod: new Date().toISOString() },
      { url: 'careers', priority: '0.6', changefreq: 'monthly', lastmod: new Date().toISOString() },
      { url: 'tech-stack', priority: '0.6', changefreq: 'monthly', lastmod: new Date().toISOString() },
      { url: 'privacy', priority: '0.5', changefreq: 'yearly', lastmod: new Date().toISOString() },
      { url: 'terms', priority: '0.5', changefreq: 'yearly', lastmod: new Date().toISOString() }
    ];

    // AI service pages
    const servicePages = [
      { slug: 'ai-chatbot-development', priority: '0.8', changefreq: 'monthly' },
      { slug: 'process-automation-suite', priority: '0.8', changefreq: 'monthly' },
      { slug: 'ai-analytics-dashboard', priority: '0.8', changefreq: 'monthly' },
      { slug: 'smart-content-generation', priority: '0.7', changefreq: 'monthly' },
      { slug: 'predictive-maintenance-ai', priority: '0.7', changefreq: 'monthly' },
      { slug: 'ai-customer-insights', priority: '0.7', changefreq: 'monthly' }
    ];

    // Generate XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add main pages
    pages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/${page.url}</loc>\n`;
      xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    // Add service pages
    servicePages.forEach(service => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/services/${service.slug}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      xml += `    <changefreq>${service.changefreq}</changefreq>\n`;
      xml += `    <priority>${service.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
