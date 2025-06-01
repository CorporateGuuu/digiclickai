#!/usr/bin/env node

/**
 * DigiClick AI Cursor Health Check Script
 * Verifies cursor implementation and configuration
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  return fs.existsSync(fullPath);
}

function readFileContent(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    return fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    return null;
  }
}

function checkCursorFiles() {
  log('\n🎯 Checking DigiClick AI Cursor Files', 'cyan');
  log('=====================================', 'cyan');
  
  const requiredFiles = [
    {
      path: 'components/CustomCursor/CustomCursor.js',
      description: 'Main cursor component',
      required: true
    },
    {
      path: 'components/CustomCursor/CustomCursor.module.css',
      description: 'Cursor styles',
      required: true
    },
    {
      path: 'components/CustomCursor/index.js',
      description: 'Cursor export file',
      required: true
    },
    {
      path: 'components/Layout.js',
      description: 'Layout component with cursor integration',
      required: true
    },
    {
      path: 'hooks/useMousePosition.js',
      description: 'Mouse position hook',
      required: true
    },
    {
      path: 'components/CustomCursor/CursorConfig.js',
      description: 'Cursor configuration',
      required: false
    },
    {
      path: 'components/CustomCursor/CursorEffects.js',
      description: 'Cursor effects library',
      required: false
    }
  ];
  
  let allRequiredExist = true;
  let score = 0;
  
  requiredFiles.forEach(file => {
    const exists = checkFileExists(file.path);
    if (exists) {
      log(`✅ ${file.path} - ${file.description}`, 'green');
      score++;
    } else {
      if (file.required) {
        log(`❌ ${file.path} - ${file.description} (REQUIRED)`, 'red');
        allRequiredExist = false;
      } else {
        log(`⚠️  ${file.path} - ${file.description} (OPTIONAL)`, 'yellow');
      }
    }
  });
  
  log(`\n📊 File Check Score: ${score}/${requiredFiles.length}`, 'cyan');
  return { allRequiredExist, score, total: requiredFiles.length };
}

function checkCursorImplementation() {
  log('\n🔍 Checking Cursor Implementation', 'cyan');
  log('==================================', 'cyan');
  
  const checks = [];
  
  // Check CustomCursor component
  const cursorContent = readFileContent('components/CustomCursor/CustomCursor.js');
  if (cursorContent) {
    checks.push({
      name: 'CustomCursor imports useMousePosition',
      passed: cursorContent.includes('useMousePosition'),
      message: 'useMousePosition hook integration'
    });
    
    checks.push({
      name: 'CustomCursor has particle trail system',
      passed: cursorContent.includes('trail') || cursorContent.includes('particle'),
      message: 'Particle trail functionality'
    });
    
    checks.push({
      name: 'CustomCursor has click effects',
      passed: cursorContent.includes('click') || cursorContent.includes('ripple'),
      message: 'Click ripple effects'
    });
    
    checks.push({
      name: 'CustomCursor has touch detection',
      passed: cursorContent.includes('touch') || cursorContent.includes('ontouchstart'),
      message: 'Touch device detection'
    });
  }
  
  // Check Layout integration
  const layoutContent = readFileContent('components/Layout.js');
  if (layoutContent) {
    checks.push({
      name: 'Layout imports CustomCursor',
      passed: layoutContent.includes('CustomCursor'),
      message: 'CustomCursor integration in Layout'
    });
    
    checks.push({
      name: 'Layout has cursor props',
      passed: layoutContent.includes('showCursor') || layoutContent.includes('cursorTheme'),
      message: 'Cursor configuration props'
    });
  }
  
  // Check useMousePosition hook
  const hookContent = readFileContent('hooks/useMousePosition.js');
  if (hookContent) {
    checks.push({
      name: 'useMousePosition returns position data',
      passed: hookContent.includes('x') && hookContent.includes('y'),
      message: 'Mouse position tracking'
    });
    
    checks.push({
      name: 'useMousePosition has performance optimizations',
      passed: hookContent.includes('requestAnimationFrame') || hookContent.includes('throttle'),
      message: 'Performance optimizations'
    });
  }
  
  // Check CSS styles
  const cssContent = readFileContent('components/CustomCursor/CustomCursor.module.css');
  if (cssContent) {
    checks.push({
      name: 'CSS has cursor animations',
      passed: cssContent.includes('@keyframes') || cssContent.includes('animation'),
      message: 'CSS animations for cursor'
    });
    
    checks.push({
      name: 'CSS has DigiClick AI colors',
      passed: cssContent.includes('#00d4ff') || cssContent.includes('#7b2cbf'),
      message: 'DigiClick AI color scheme'
    });
  }
  
  let passedChecks = 0;
  checks.forEach(check => {
    if (check.passed) {
      log(`✅ ${check.message}`, 'green');
      passedChecks++;
    } else {
      log(`❌ ${check.message}`, 'red');
    }
  });
  
  log(`\n📊 Implementation Score: ${passedChecks}/${checks.length}`, 'cyan');
  return { passedChecks, totalChecks: checks.length };
}

function checkDependencies() {
  log('\n📦 Checking Dependencies', 'cyan');
  log('========================', 'cyan');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    log('❌ package.json not found', 'red');
    return { score: 0, total: 1 };
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    { name: 'gsap', description: 'GSAP animation library', required: true },
    { name: 'next', description: 'Next.js framework', required: true },
    { name: 'react', description: 'React library', required: true }
  ];
  
  const optionalDeps = [
    { name: '@testing-library/react', description: 'React testing utilities', required: false },
    { name: 'jest', description: 'Testing framework', required: false }
  ];
  
  let score = 0;
  const allDeps = [...requiredDeps, ...optionalDeps];
  
  allDeps.forEach(dep => {
    if (dependencies[dep.name]) {
      log(`✅ ${dep.name} (${dependencies[dep.name]}) - ${dep.description}`, 'green');
      score++;
    } else {
      if (dep.required) {
        log(`❌ ${dep.name} - ${dep.description} (REQUIRED)`, 'red');
      } else {
        log(`⚠️  ${dep.name} - ${dep.description} (OPTIONAL)`, 'yellow');
      }
    }
  });
  
  log(`\n📊 Dependencies Score: ${score}/${allDeps.length}`, 'cyan');
  return { score, total: allDeps.length };
}

function checkConfiguration() {
  log('\n⚙️  Checking Configuration', 'cyan');
  log('==========================', 'cyan');
  
  const checks = [];
  
  // Check _app.js integration
  const appContent = readFileContent('pages/_app.js');
  if (appContent) {
    checks.push({
      name: 'Layout integrated in _app.js',
      passed: appContent.includes('Layout'),
      message: '_app.js uses Layout component'
    });
  }
  
  // Check environment variables
  const envExample = readFileContent('.env.example') || readFileContent('.env.local.example');
  if (envExample) {
    checks.push({
      name: 'Environment variables documented',
      passed: envExample.includes('NEXT_PUBLIC_'),
      message: 'Environment variables example file'
    });
  }
  
  // Check if globals.css has cursor styles
  const globalsCss = readFileContent('styles/globals.css');
  if (globalsCss) {
    checks.push({
      name: 'Global CSS has cursor integration',
      passed: globalsCss.includes('cursor') || globalsCss.includes('glow-text') || globalsCss.includes('cta-button'),
      message: 'Global CSS cursor classes'
    });
  }
  
  let passedChecks = 0;
  checks.forEach(check => {
    if (check.passed) {
      log(`✅ ${check.message}`, 'green');
      passedChecks++;
    } else {
      log(`❌ ${check.message}`, 'red');
    }
  });
  
  log(`\n📊 Configuration Score: ${passedChecks}/${checks.length}`, 'cyan');
  return { passedChecks, totalChecks: checks.length };
}

function generateReport(results) {
  log('\n📋 DigiClick AI Cursor Health Report', 'bright');
  log('====================================', 'bright');
  
  const totalScore = results.files.score + results.implementation.passedChecks + 
                    results.dependencies.score + results.configuration.passedChecks;
  const totalPossible = results.files.total + results.implementation.totalChecks + 
                       results.dependencies.total + results.configuration.totalChecks;
  
  const percentage = Math.round((totalScore / totalPossible) * 100);
  
  log(`\n📊 Overall Score: ${totalScore}/${totalPossible} (${percentage}%)`, 'cyan');
  
  if (percentage >= 90) {
    log('🎉 Excellent! Your cursor implementation is ready for production.', 'green');
  } else if (percentage >= 75) {
    log('✅ Good! Minor improvements needed for optimal performance.', 'yellow');
  } else if (percentage >= 50) {
    log('⚠️  Fair. Several components need attention before deployment.', 'yellow');
  } else {
    log('❌ Poor. Significant work needed for cursor functionality.', 'red');
  }
  
  log('\n🔧 Recommendations:', 'cyan');
  
  if (!results.files.allRequiredExist) {
    log('   • Install missing required cursor files', 'yellow');
  }
  
  if (results.implementation.passedChecks < results.implementation.totalChecks) {
    log('   • Complete cursor implementation features', 'yellow');
  }
  
  if (results.dependencies.score < results.dependencies.total) {
    log('   • Install missing dependencies (especially GSAP)', 'yellow');
  }
  
  if (results.configuration.passedChecks < results.configuration.totalChecks) {
    log('   • Configure cursor integration in _app.js and global styles', 'yellow');
  }
  
  log('\n🚀 Next Steps:', 'cyan');
  log('   1. Run: npm run dev', 'cyan');
  log('   2. Visit: http://localhost:3000/cursor-demo', 'cyan');
  log('   3. Test cursor interactions on all pages', 'cyan');
  log('   4. Deploy with: npm run deploy', 'cyan');
}

function main() {
  log('🎯 DigiClick AI Cursor Health Check', 'bright');
  log('===================================', 'bright');
  
  const results = {
    files: checkCursorFiles(),
    implementation: checkCursorImplementation(),
    dependencies: checkDependencies(),
    configuration: checkConfiguration()
  };
  
  generateReport(results);
}

// Run the health check
if (require.main === module) {
  main();
}

module.exports = {
  checkCursorFiles,
  checkCursorImplementation,
  checkDependencies,
  checkConfiguration
};
