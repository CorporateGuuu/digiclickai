const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/phone_electronics_store',
  ssl: false,
});

// Generate sitemap.xml
async function generateSitemap(baseUrl) {
  try {
    // Get all products
    const productsQuery = `
      SELECT slug, updated_at FROM products
    `;
    const productsResult = await pool.query(productsQuery);
    
    // Get all categories
    const categoriesQuery = `
      SELECT slug, updated_at FROM categories
    `;
    const categoriesResult = await pool.query(categoriesQuery);
    
    // Start XML content
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static pages
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: 'products', priority: '0.8', changefreq: 'daily' },
      { url: 'categories', priority: '0.8', changefreq: 'weekly' },
      { url: 'login', priority: '0.5', changefreq: 'monthly' },
      { url: 'register', priority: '0.5', changefreq: 'monthly' },
      { url: 'cart', priority: '0.6', changefreq: 'monthly' }
    ];
    
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });
    
    // Add product pages
    productsResult.rows.forEach(product => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/products/${product.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(product.updated_at).toISOString()}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });
    
    // Add category pages
    categoriesResult.rows.forEach(category => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/categories/${category.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(category.updated_at).toISOString()}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });
    
    // End XML content
    xml += '</urlset>';
    
    // Write sitemap to file
    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(sitemapPath, xml);
    
    // // // console.log(`Sitemap generated at ${sitemapPath}`);
    return true;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return false;
  }
}

module.exports = {
  generateSitemap
};
