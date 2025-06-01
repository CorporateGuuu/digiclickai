
    const fs = require('fs');
    const path = require('path');
    const sharp = require('sharp');
    
    const PUBLIC_DIR = path.join(__dirname, '../public');
    const IMAGE_DIRS = ['images', 'icons', 'banners'];
    
    async function optimizeImage(filePath) {
      const ext = path.extname(filePath).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return;
      
      try {
        const image = sharp(filePath);
        const metadata = await image.metadata();
        
        // Skip if already optimized
        if (metadata.format === 'webp') return;
        
        // Create webp version
        const webpPath = filePath.replace(ext, '.webp');
        await image.webp({ quality: 80 }).toFile(webpPath);
        
        // Resize large images
        if (metadata.width > 1200 || metadata.height > 1200) {
          await image.resize({ 
            width: Math.min(metadata.width, 1200),
            height: Math.min(metadata.height, 1200),
            fit: 'inside'
          }).toFile(filePath + '.optimized');
          
          fs.renameSync(filePath + '.optimized', filePath);
          // console.log(`Resized large image: ${filePath}`);
        }
        
        // console.log(`Created WebP version: ${webpPath}`);
      } catch (error) {
        console.error(`Error optimizing ${filePath}:`, error);
      }
    }
    
    async function processDirectory(dir) {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          await processDirectory(filePath);
        } else if (stats.isFile()) {
          await optimizeImage(filePath);
        }
      }
    }
    
    async function main() {
      for (const imageDir of IMAGE_DIRS) {
        const dirPath = path.join(PUBLIC_DIR, imageDir);
        if (fs.existsSync(dirPath)) {
          // console.log(`Processing directory: ${dirPath}`);
          await processDirectory(dirPath);
        }
      }
    }
    
    main().catch(console.error);
    