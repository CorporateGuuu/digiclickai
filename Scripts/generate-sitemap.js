const fs = require('fs');
const path = require('path');

// Base URL of the website
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BASE_URL || 'https://digiclickai.netlify.app';

// Generate sitemap for DigiClick AI
function generateSitemap() {
  try {
    console.log('Generating DigiClick AI sitemap...');

    // Start XML content
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add DigiClick AI static pages
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: 'portfolio', priority: '0.9', changefreq: 'weekly' },
      { url: 'about', priority: '0.8', changefreq: 'monthly' },
      { url: 'contact', priority: '0.8', changefreq: 'monthly' },
      { url: 'pricing', priority: '0.8', changefreq: 'weekly' },
      { url: 'cursor-demo', priority: '0.7', changefreq: 'monthly' },
      { url: 'blog', priority: '0.7', changefreq: 'weekly' },
      { url: 'careers', priority: '0.6', changefreq: 'monthly' },
      { url: 'tech-stack', priority: '0.6', changefreq: 'monthly' },
      { url: 'privacy', priority: '0.5', changefreq: 'yearly' },
      { url: 'terms', priority: '0.5', changefreq: 'yearly' }
    ];

    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    // Add DigiClick AI service pages
    const servicePages = [
      { slug: 'ai-chatbot-development', priority: '0.8' },
      { slug: 'process-automation-suite', priority: '0.8' },
      { slug: 'ai-analytics-dashboard', priority: '0.8' },
      { slug: 'smart-content-generation', priority: '0.7' },
      { slug: 'predictive-maintenance-ai', priority: '0.7' },
      { slug: 'ai-customer-insights', priority: '0.7' }
    ];

    servicePages.forEach(service => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/services/${service.slug}</loc>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += `    <priority>${service.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    // End XML content
    xml += '</urlset>';

    // Write sitemap to public directory
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(sitemapPath, xml);

    console.log(`✅ DigiClick AI sitemap generated successfully at: ${sitemapPath}`);
    console.log(`📍 Base URL: ${baseUrl}`);
    console.log(`📄 Pages included: ${staticPages.length + servicePages.length}`);

    return true;
  } catch (error) {
    console.error('❌ Error generating DigiClick AI sitemap:', error);
    return false;
  }
}

// Generate sitemap
const success = generateSitemap();
process.exit(success ? 0 : 1);
