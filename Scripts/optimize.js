const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Configuration
const IGNORED_DIRS = ['node_modules', '.next', '.git', 'coverage'];

// Function to get all JS files recursively
async function getAllJsFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = path.resolve(dir, subdir);
    if (IGNORED_DIRS.includes(subdir)) return [];
    
    const stats = await stat(res);
    if (stats.isDirectory()) {
      return getAllJsFiles(res);
    } else if (stats.isFile() && (res.endsWith('.js') || res.endsWith('.jsx'))) {
      return res;
    }
    return [];
  }));
  
  return files.flat();
}

// Function to optimize imports
async function optimizeImports(filePath) {
  try {
    let content = await readFile(filePath, 'utf8');
    const originalSize = content.length;
    
    // Remove unused imports
    const importRegex = /import\s+{([^}]+)}\s+from\s+['"][^'"]+['"];?/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const imports = match[1].split(',').map(i => i.trim());
      
      for (const importName of imports) {
        if (importName && !content.includes(importName, match.index + match[0].length)) {
          // This import might be unused, but check if it's not a React component
          if (!content.includes(`<${importName}`) && !content.includes(`<${importName.replace(/^use/, '')}`)) {
            // // console.log(`Potential unused import in ${filePath}: ${importName}`);
          }
        }
      }
    }
    
    // Optimize React imports
    content = content.replace(/import React, { useState, useEffect } from ['"]react['"];/g, 
                             'import React from "react";\nimport { useState, useEffect } from "react";');
    
    // Remove console.log statements in production
    content = content.replace(/console\.log\(/g, '// // // console.log(');
    
    // Add React.memo for simple components
    if (content.includes('function') && content.includes('return (') && 
        !content.includes('useState') && !content.includes('useEffect') && 
        !content.includes('export default memo') && !content.includes('React.memo')) {
      
      const functionMatch = /export\s+default\s+function\s+(\w+)/.exec(content);
      if (functionMatch) {
        const componentName = functionMatch[1];
        content = content.replace(`export default function ${componentName}`, 
                                 `function ${componentName}`);
        content = content + `\nexport default React.memo(${componentName});\n`;
        // // console.log(`Added React.memo to component ${componentName} in ${filePath}`);
      }
    }
    
    // Write optimized content back
    if (content.length !== originalSize) {
      await writeFile(filePath, content, 'utf8');
      // // console.log(`Optimized ${filePath} (${originalSize} -> ${content.length} bytes)`);
    }
  } catch (error) {
    console.error(`Error optimizing ${filePath}:`, error);
  }
}

// Function to optimize images
async function optimizeImages() {
  // // console.log('\n🖼️ Optimizing images...');
  try {
    // Check if sharp is installed
    try {
      require.resolve('sharp');
    } catch (e) {
      // // console.log('Installing sharp for image optimization...');
      execSync('npm install sharp --save', { stdio: 'inherit' });
    }
    
    // Create an image optimization script
    const scriptContent = `
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
          // // console.log(\`Resized large image: \${filePath}\`);
        }
        
        // // console.log(\`Created WebP version: \${webpPath}\`);
      } catch (error) {
        console.error(\`Error optimizing \${filePath}:\`, error);
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
          // // console.log(\`Processing directory: \${dirPath}\`);
          await processDirectory(dirPath);
        }
      }
    }
    
    main().catch(console.error);
    `;
    
    fs.writeFileSync(path.join(__dirname, 'optimize-images.js'), scriptContent);
    
    // Run the image optimization script
    execSync('node scripts/optimize-images.js', { stdio: 'inherit' });
    
    return true;
  } catch (error) {
    console.error('❌ Image optimization failed:', error);
    return false;
  }
}

// Function to optimize CSS
async function optimizeCss() {
  // // console.log('\n🎨 Optimizing CSS...');
  try {
    // Check if required packages are installed
    try {
      require.resolve('cssnano');
      require.resolve('postcss');
    } catch (e) {
      // // console.log('Installing CSS optimization packages...');
      execSync('npm install cssnano postcss postcss-cli --save-dev', { stdio: 'inherit' });
    }
    
    // Create a PostCSS config if it doesn't exist
    const postcssConfigPath = path.join(__dirname, '../postcss.config.js');
    if (!fs.existsSync(postcssConfigPath)) {
      const configContent = `
      module.exports = {
        plugins: {
          'postcss-import': {},
          'tailwindcss': {},
          'autoprefixer': {},
          'cssnano': {
            preset: 'default',
          },
        },
      };
      `;
      fs.writeFileSync(postcssConfigPath, configContent);
      // // console.log('Created PostCSS config file');
    }
    
    // Find all CSS files
    const cssFiles = [];
    const stylesDir = path.join(__dirname, '../styles');
    if (fs.existsSync(stylesDir)) {
      const files = fs.readdirSync(stylesDir);
      for (const file of files) {
        if (file.endsWith('.css') && !file.endsWith('.min.css')) {
          cssFiles.push(path.join(stylesDir, file));
        }
      }
    }
    
    // Optimize each CSS file
    for (const cssFile of cssFiles) {
      const outputFile = cssFile.replace('.css', '.min.css');
      execSync(`npx postcss ${cssFile} -o ${outputFile}`, { stdio: 'inherit' });
      // // console.log(`Optimized ${cssFile} -> ${outputFile}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ CSS optimization failed:', error);
    return false;
  }
}

// Main function
async function main() {
  // // console.log('🚀 Starting application optimization...');
  
  // Optimize JS files
  // // console.log('\n📝 Optimizing JavaScript files...');
  const jsFiles = await getAllJsFiles('.');
  // // console.log(`Found ${jsFiles.length} JavaScript files to optimize`);
  
  for (const file of jsFiles) {
    await optimizeImports(file);
  }
  
  // Optimize images
  await optimizeImages();
  
  // Optimize CSS
  await optimizeCss();
  
  // Run production build to verify optimizations
  // // console.log('\n🏗️ Running production build to verify optimizations...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    // // console.log('✅ Production build successful');
  } catch (error) {
    console.error('❌ Production build failed:', error);
  }
  
  // // console.log('\n✅ Optimization complete!');
}

main().catch(error => {
  console.error('❌ Optimization script failed:', error);
  process.exit(1);
});
