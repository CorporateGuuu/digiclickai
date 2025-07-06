#!/usr/bin/env node

/**
 * DigiClick AI Deployment Script
 * Automates the deployment process with cursor functionality testing
 */


const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  log(`\n🔄 ${description}...`, 'cyan');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed successfully`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    return false;
  }
}

function checkEnvironmentVariables() {
  log('\n🔍 Checking environment variables...', 'yellow');
  
  const requiredVars = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_APP_URL'
  ];
  
  const optionalVars = [
    'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID',
    'NEXT_PUBLIC_CURSOR_PERFORMANCE_MODE'
  ];
  
  let allRequired = true;
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      log(`❌ Missing required environment variable: ${varName}`, 'red');
      allRequired = false;
    } else {
      log(`✅ ${varName}: ${process.env[varName]}`, 'green');
    }
  });
  
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      log(`✅ ${varName}: ${process.env[varName]}`, 'green');
    } else {
      log(`⚠️  Optional variable not set: ${varName}`, 'yellow');
    }
  });
  
  return allRequired;
}

function checkCursorFiles() {
  log('\n🎯 Checking DigiClick AI Cursor files...', 'yellow');
  
  const requiredFiles = [
    'components/CustomCursor/CustomCursor.js',
    'components/CustomCursor/CustomCursor.module.css',
    'components/CustomCursor/index.js',
    'components/Layout.js',
    'hooks/useMousePosition.js'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      log(`✅ ${filePath}`, 'green');
    } else {
      log(`❌ Missing file: ${filePath}`, 'red');
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

function runCursorTests() {
  log('\n🧪 Running cursor functionality tests...', 'yellow');
  
  // Check if test files exist
  const testFiles = [
    'tests/cursor.test.js',
    'tests/layout.test.js'
  ];
  
  let hasTests = false;
  testFiles.forEach(testFile => {
    if (fs.existsSync(path.join(process.cwd(), testFile))) {
      hasTests = true;
    }
  });
  
  if (hasTests) {
    return execCommand('npm test', 'Running tests');
  } else {
    log('⚠️  No cursor tests found, skipping test phase', 'yellow');
    return true;
  }
}

function buildApplication() {
  log('\n🏗️  Building DigiClick AI application...', 'yellow');
  return execCommand('npm run build', 'Building application');
}



function deployToNetlify(staging = false) {
  log(`\n🚀 Deploying to Netlify ${staging ? '(staging)' : '(production)'}...`, 'yellow');
  
  // Check if Netlify CLI is installed
  try {
    execSync('netlify --version', { stdio: 'pipe' });
  } catch (error) {
    log('❌ Netlify CLI not found. Install with: npm i -g netlify-cli', 'red');
    return false;
  }
  
  const deployCommand = staging ? 'netlify deploy --dir=out' : 'netlify deploy --prod --dir=out';
  return execCommand(deployCommand, `Deploying to Netlify ${staging ? 'staging' : 'production'}`);
}

function generateSitemap() {
  log('\n🗺️  Generating sitemap...', 'yellow');
  
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${process.env.NEXT_PUBLIC_APP_URL}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${process.env.NEXT_PUBLIC_APP_URL}/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${process.env.NEXT_PUBLIC_APP_URL}/services</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${process.env.NEXT_PUBLIC_APP_URL}/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${process.env.NEXT_PUBLIC_APP_URL}/cursor-demo</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${process.env.NEXT_PUBLIC_APP_URL}/login</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.5</priority>
  </url>
</urlset>`;

  try {
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent);
    log('✅ Sitemap generated successfully', 'green');
    return true;
  } catch (error) {
    log(`❌ Failed to generate sitemap: ${error.message}`, 'red');
    return false;
  }
}

function promptApproval() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('⚠️  Are you sure you want to proceed with production deployment? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

async function main() {
  log('🎯 DigiClick AI Deployment Script', 'bright');
  log('=====================================', 'bright');
  
  const args = process.argv.slice(2);
  const platform = args[0] || 'vercel';
  const skipTests = args.includes('--skip-tests');
  const staging = args.includes('--staging');
  
  log(`\n📋 Deployment Configuration:`, 'cyan');
  log(`   Platform: ${platform}`, 'cyan');
  log(`   Skip Tests: ${skipTests}`, 'cyan');
  log(`   Staging: ${staging}`, 'cyan');
  
  // Step 1: Check environment variables
  if (!checkEnvironmentVariables()) {
    log('\n❌ Environment check failed. Please set required variables.', 'red');
    process.exit(1);
  }
  
  // Step 2: Check cursor files
  if (!checkCursorFiles()) {
    log('\n❌ Cursor files check failed. Please ensure all cursor components exist.', 'red');
    process.exit(1);
  }
  
  // Step 3: Install dependencies
  if (!execCommand('npm install', 'Installing dependencies')) {
    process.exit(1);
  }
  
  // Step 4: Run tests (optional)
  if (!skipTests && !runCursorTests()) {
    log('\n❌ Tests failed. Use --skip-tests to bypass.', 'red');
    process.exit(1);
  }
  
  // Step 5: Generate sitemap
  generateSitemap();
  
  // Step 6: Build application
  if (!buildApplication()) {
    process.exit(1);
  }
  
  // Step 7: Deployment approval for production
  if (!staging) {
    const approved = await promptApproval();
    if (!approved) {
      log('❌ Deployment aborted by user.', 'red');
      process.exit(1);
    }
  }
  
  // Step 8: Deploy based on platform and environment
  let deploymentSuccess = false;
  
  switch (platform.toLowerCase()) {
    case 'netlify':
      deploymentSuccess = deployToNetlify(staging);
      break;
    default:
      log(`❌ Unknown platform: ${platform}. Supported: netlify`, 'red');
      process.exit(1);
  }
  
  if (deploymentSuccess) {
    log('\n🎉 Deployment completed successfully!', 'green');
    log('\n📋 Post-deployment checklist:', 'yellow');
    log('   ✅ Test cursor functionality on live site', 'yellow');
    log('   ✅ Verify mobile responsiveness', 'yellow');
    log('   ✅ Check Google Analytics integration', 'yellow');
    log('   ✅ Submit sitemap to Google Search Console', 'yellow');
    log('   ✅ Test all interactive elements', 'yellow');
    
    if (process.env.NEXT_PUBLIC_APP_URL) {
      log(`\n🌐 Live site: ${process.env.NEXT_PUBLIC_APP_URL}`, 'cyan');
      log(`🎯 Cursor demo: ${process.env.NEXT_PUBLIC_APP_URL}/cursor-demo`, 'cyan');
    }
  } else {
    log('\n❌ Deployment failed. Check the logs above for details.', 'red');
    process.exit(1);
  }
}

// Run the deployment script
if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironmentVariables,
  checkCursorFiles,
  buildApplication,
  deployToNetlify,
  generateSitemap
};
