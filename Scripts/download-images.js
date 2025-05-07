const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Create directories if they don't exist
const directories = [
  'public/images',
  'public/images/products',
  'public/images/products/iphone',
  'public/images/products/samsung',
  'public/images/products/ipad',
  'public/images/products/macbook',
  'public/images/products/tools',
  'public/images/certificates',
  'public/images/shipping',
  'public/images/payments',
  'public/images/social',
  'public/images/flags',
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Function to download an image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filepath)) {
      console.log(`File already exists: ${filepath}`);
      return resolve();
    }
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download image: ${response.statusCode}`));
      }
      
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${filepath}`);
        resolve();
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete the file if there was an error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Product images to download
const productImages = [
  {
    url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=329&q=80',
    path: 'public/images/products/iphone/iphone-13-pro-screen.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1581092921461-7031e8fbc6e5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    path: 'public/images/products/tools/repair-tool-kit.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1604671368394-2240d0b1bb6c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    path: 'public/images/products/samsung/galaxy-s22-battery.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80',
    path: 'public/images/products/ipad/ipad-pro-lcd.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=736&q=80',
    path: 'public/images/products/iphone/iphone-12-screen.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    path: 'public/images/products/samsung/galaxy-s21-battery.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    path: 'public/images/hero-banner.jpg'
  }
];

// Create SVG placeholders for other images
const svgPlaceholders = [
  { name: 'ipad-mini.svg', path: 'public/images/products/ipad' },
  { name: 'macbook-keyboard.svg', path: 'public/images/products/macbook' },
  { name: 'screwdriver-set.svg', path: 'public/images/products/tools' },
  { name: 'heat-gun.svg', path: 'public/images/products/tools' },
  { name: 'logo-dark.svg', path: 'public/images' },
  { name: 'gapp-banner.jpg', path: 'public/images' },
  { name: 'r2-v3.svg', path: 'public/images/certificates' },
  { name: 'certificate-001.svg', path: 'public/images/certificates' },
  { name: 'certificate-002.svg', path: 'public/images/certificates' },
  { name: 'certificate-003.svg', path: 'public/images/certificates' },
  { name: 'fedex.svg', path: 'public/images/shipping' },
  { name: 'ups.svg', path: 'public/images/shipping' },
  { name: 'usps.svg', path: 'public/images/shipping' },
  { name: 'amex.svg', path: 'public/images/payments' },
  { name: 'mastercard.svg', path: 'public/images/payments' },
  { name: 'venmo.svg', path: 'public/images/payments' },
  { name: 'paypal.svg', path: 'public/images/payments' },
  { name: 'paypal-credit.svg', path: 'public/images/payments' },
  { name: 'visa.svg', path: 'public/images/payments' },
  { name: 'discover.svg', path: 'public/images/payments' },
  { name: 'credit-key.svg', path: 'public/images/payments' },
  { name: 'wire-transfer.svg', path: 'public/images/payments' },
  { name: 'facebook.svg', path: 'public/images/social' },
  { name: 'twitter.svg', path: 'public/images/social' },
  { name: 'linkedin.svg', path: 'public/images/social' },
  { name: 'instagram.svg', path: 'public/images/social' },
  { name: 'youtube.svg', path: 'public/images/social' },
  { name: 'us-flag.svg', path: 'public/images/flags' },
];

// Create SVG placeholders
svgPlaceholders.forEach(({ name, path: dirPath }) => {
  const filePath = `${dirPath}/${name}`;
  
  if (!fs.existsSync(filePath)) {
    if (name.endsWith('.svg')) {
      // Create a simple SVG placeholder
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#f0f0f0" />
  <text x="50" y="50" font-family="Arial" font-size="12" text-anchor="middle" dominant-baseline="middle" fill="#333">
    ${name.replace('.svg', '')}
  </text>
</svg>`;
      
      fs.writeFileSync(filePath, svgContent);
      console.log(`Created SVG placeholder: ${filePath}`);
    } else if (name.endsWith('.jpg') || name.endsWith('.png')) {
      // Create a simple colored rectangle for image placeholders
      const width = 800;
      const height = 400;
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#0066cc" />
  <text x="${width/2}" y="${height/2}" font-family="Arial" font-size="24" text-anchor="middle" dominant-baseline="middle" fill="white">
    ${name.replace(/\.(jpg|png)$/, '')}
  </text>
</svg>`;
      
      const tempSvgPath = `${dirPath}/${name.replace(/\.(jpg|png)$/, '.svg')}`;
      fs.writeFileSync(tempSvgPath, svgContent);
      
      try {
        // Convert SVG to JPG/PNG using ImageMagick if available
        execSync(`convert ${tempSvgPath} ${filePath}`);
        fs.unlinkSync(tempSvgPath); // Remove temporary SVG
        console.log(`Created image placeholder: ${filePath}`);
      } catch (error) {
        console.log(`Could not convert SVG to image. Keeping SVG version.`);
        // If ImageMagick is not available, just rename the SVG
        fs.renameSync(tempSvgPath, filePath.replace(/\.(jpg|png)$/, '.svg'));
      }
    }
  }
});

// Download all product images
async function downloadAllImages() {
  for (const image of productImages) {
    try {
      await downloadImage(image.url, image.path);
    } catch (error) {
      console.error(`Error downloading ${image.url}: ${error.message}`);
    }
  }
  console.log('All images processed');
}

downloadAllImages();
