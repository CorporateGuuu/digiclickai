const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons with different sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const badgeSize = 72;

// Function to create a simple SVG icon
function createIconSVG(size, color = '#0066cc') {
  const padding = Math.floor(size * 0.2);
  const innerSize = size - (padding * 2);
  
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="white" />
    <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" fill="${color}" rx="8" />
    <text x="${size/2}" y="${size/2 + 8}" font-family="Arial" font-size="${innerSize/2}" font-weight="bold" fill="white" text-anchor="middle">MD</text>
  </svg>`;
}

// Generate icons
sizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  // For demo purposes, we're creating SVG files instead of PNGs
  // In a real app, you would use a library like sharp to create actual PNG files
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, createIconSVG(size));
  
  // // // console.log(`Created icon: ${svgPath}`);
});

// Create badge icon
const badgePath = path.join(iconsDir, `badge-${badgeSize}x${badgeSize}.svg`);
fs.writeFileSync(badgePath, createIconSVG(badgeSize, '#dc2626'));
// // // console.log(`Created badge: ${badgePath}`);

// // // console.log('Icon generation complete!');
