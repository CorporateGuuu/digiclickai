const { generateSitemap } = require('../utils/sitemap');

// Base URL of the website
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

// Generate sitemap
generateSitemap(baseUrl)
  .then(success => {
    if (success) {
      // // // console.log('Sitemap generated successfully');
      process.exit(0);
    } else {
      console.error('Failed to generate sitemap');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
