/**
 * Script to check for common security vulnerabilities in the codebase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Patterns to search for
const vulnerabilityPatterns = [
  {
    name: 'Hardcoded JWT Secret',
    pattern: /const\s+(?:JWT_SECRET|jwtSecret)\s*=\s*['"]([^'"]+)['"]/g,
    severity: 'HIGH',
    recommendation: 'Use environment variables for JWT secrets'
  },
  {
    name: 'Hardcoded Session Secret',
    pattern: /secret\s*:\s*['"]([^'"]+)['"]/g,
    severity: 'HIGH',
    recommendation: 'Use environment variables for session secrets'
  },
  {
    name: 'Hardcoded Database Credentials',
    pattern: /(?:user|username|password|passwd)\s*:\s*['"]([^'"]+)['"]/g,
    severity: 'HIGH',
    recommendation: 'Use environment variables for database credentials'
  },
  {
    name: 'Hardcoded API Keys',
    pattern: /(?:api[_-]?key|apikey|api[_-]?secret|apisecret)\s*[:=]\s*['"]([^'"]+)['"]/gi,
    severity: 'HIGH',
    recommendation: 'Use environment variables for API keys'
  },
  {
    name: 'SQL Injection Vulnerability',
    pattern: /(?:pool|db|connection)\.query\(\s*[\`'"]SELECT.*\$\{.*\}/g,
    severity: 'CRITICAL',
    recommendation: 'Use parameterized queries with prepared statements'
  },
  {
    name: 'XSS Vulnerability',
    pattern: /(?:innerHTML|outerHTML|document\.write)\s*=\s*/g,
    severity: 'HIGH',
    recommendation: 'Use textContent or innerText instead of innerHTML'
  },
  {
    name: 'Insecure Cookie Settings',
    pattern: /cookie\s*:\s*\{(?![^}]*secure)(?![^}]*httpOnly)(?![^}]*sameSite)/g,
    severity: 'MEDIUM',
    recommendation: 'Set secure, httpOnly, and sameSite attributes for cookies'
  },
  {
    name: 'Weak Password Hashing',
    pattern: /(?:md5|sha1)\(/g,
    severity: 'HIGH',
    recommendation: 'Use bcrypt or Argon2 for password hashing'
  },
  {
    name: 'Insecure Redirect',
    pattern: /res\.redirect\(\s*req\.(?:query|body|params)\.(?:url|redirect|next)/g,
    severity: 'MEDIUM',
    recommendation: 'Validate and sanitize redirect URLs'
  },
  {
    name: 'Insecure File Operations',
    pattern: /(?:fs|require\(['"]\s*fs\s*['"]\))\.(?:readFile|writeFile|appendFile|createReadStream|createWriteStream)\(\s*(?:req|request)\.(?:query|body|params)/g,
    severity: 'HIGH',
    recommendation: 'Validate and sanitize file paths'
  },
  {
    name: 'Insecure Regular Expression',
    pattern: /new RegExp\(\s*(?:req|request)\.(?:query|body|params)/g,
    severity: 'MEDIUM',
    recommendation: 'Validate and sanitize user input before using in RegExp'
  },
  {
    name: 'Insecure Eval',
    pattern: /eval\(/g,
    severity: 'CRITICAL',
    recommendation: 'Never use eval() with user input'
  },
  {
    name: 'Insecure Child Process',
    pattern: /(?:exec|spawn|execFile|fork)\(\s*(?:req|request)\.(?:query|body|params)/g,
    severity: 'CRITICAL',
    recommendation: 'Never use child_process with user input'
  }
];

// Function to check a file for vulnerabilities
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const vulnerabilities = [];
  
  vulnerabilityPatterns.forEach(pattern => {
    const matches = content.match(pattern.pattern);
    if (matches) {
      vulnerabilities.push({
        file: filePath,
        vulnerability: pattern.name,
        severity: pattern.severity,
        recommendation: pattern.recommendation,
        count: matches.length
      });
    }
  });
  
  return vulnerabilities;
}

// Function to recursively scan a directory
function scanDirectory(dir, fileExtensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const vulnerabilities = [];
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('node_modules') && !file.startsWith('.git')) {
      // Recursively scan subdirectories
      vulnerabilities.push(...scanDirectory(filePath, fileExtensions));
    } else if (stat.isFile() && fileExtensions.includes(path.extname(filePath))) {
      // Check file for vulnerabilities
      vulnerabilities.push(...checkFile(filePath));
    }
  });
  
  return vulnerabilities;
}

// Function to check for outdated dependencies
function checkDependencies() {
  // // // console.log(`${colors.blue}Checking for outdated dependencies...${colors.reset}`);
  
  try {
    const output = execSync('npm audit --json', { encoding: 'utf8' });
    const auditResult = JSON.parse(output);
    
    if (auditResult.vulnerabilities) {
      const { low, moderate, high, critical } = auditResult.vulnerabilities;
      
      // // // console.log(`${colors.yellow}Vulnerability summary:${colors.reset}`);
      // // // console.log(`${colors.green}Low: ${low || 0}${colors.reset}`);
      // // // console.log(`${colors.yellow}Moderate: ${moderate || 0}${colors.reset}`);
      // // // console.log(`${colors.red}High: ${high || 0}${colors.reset}`);
      // // // console.log(`${colors.magenta}Critical: ${critical || 0}${colors.reset}`);
      
      if (high || critical) {
        // // // console.log(`\n${colors.red}WARNING: Your project has high or critical vulnerabilities!${colors.reset}`);
        // // // console.log(`Run ${colors.cyan}npm audit fix${colors.reset} to fix them.`);
      }
    }
  } catch (error) {
    console.error(`${colors.red}Error checking dependencies:${colors.reset}`, error.message);
  }
}

// Main function
function main() {
  // // // console.log(`${colors.blue}Starting security vulnerability scan...${colors.reset}`);
  
  // Scan the project directory
  const vulnerabilities = scanDirectory('.');
  
  // Group vulnerabilities by severity
  const groupedVulnerabilities = vulnerabilities.reduce((acc, vuln) => {
    if (!acc[vuln.severity]) {
      acc[vuln.severity] = [];
    }
    acc[vuln.severity].push(vuln);
    return acc;
  }, {});
  
  // Print results
  // // // console.log(`\n${colors.blue}Scan complete. Found ${vulnerabilities.length} potential vulnerabilities.${colors.reset}`);
  
  if (vulnerabilities.length > 0) {
    // Print critical vulnerabilities
    if (groupedVulnerabilities.CRITICAL) {
      // // // console.log(`\n${colors.magenta}CRITICAL VULNERABILITIES (${groupedVulnerabilities.CRITICAL.length}):${colors.reset}`);
      groupedVulnerabilities.CRITICAL.forEach(vuln => {
        // // // console.log(`${colors.red}[${vuln.vulnerability}]${colors.reset} in ${colors.cyan}${vuln.file}${colors.reset} (${vuln.count} occurrences)`);
        // // // console.log(`  ${colors.yellow}Recommendation:${colors.reset} ${vuln.recommendation}`);
      });
    }
    
    // Print high vulnerabilities
    if (groupedVulnerabilities.HIGH) {
      // // // console.log(`\n${colors.red}HIGH VULNERABILITIES (${groupedVulnerabilities.HIGH.length}):${colors.reset}`);
      groupedVulnerabilities.HIGH.forEach(vuln => {
        // // // console.log(`${colors.red}[${vuln.vulnerability}]${colors.reset} in ${colors.cyan}${vuln.file}${colors.reset} (${vuln.count} occurrences)`);
        // // // console.log(`  ${colors.yellow}Recommendation:${colors.reset} ${vuln.recommendation}`);
      });
    }
    
    // Print medium vulnerabilities
    if (groupedVulnerabilities.MEDIUM) {
      // // // console.log(`\n${colors.yellow}MEDIUM VULNERABILITIES (${groupedVulnerabilities.MEDIUM.length}):${colors.reset}`);
      groupedVulnerabilities.MEDIUM.forEach(vuln => {
        // // // console.log(`${colors.yellow}[${vuln.vulnerability}]${colors.reset} in ${colors.cyan}${vuln.file}${colors.reset} (${vuln.count} occurrences)`);
        // // // console.log(`  ${colors.yellow}Recommendation:${colors.reset} ${vuln.recommendation}`);
      });
    }
    
    // Print low vulnerabilities
    if (groupedVulnerabilities.LOW) {
      // // // console.log(`\n${colors.green}LOW VULNERABILITIES (${groupedVulnerabilities.LOW.length}):${colors.reset}`);
      groupedVulnerabilities.LOW.forEach(vuln => {
        // // // console.log(`${colors.green}[${vuln.vulnerability}]${colors.reset} in ${colors.cyan}${vuln.file}${colors.reset} (${vuln.count} occurrences)`);
        // // // console.log(`  ${colors.yellow}Recommendation:${colors.reset} ${vuln.recommendation}`);
      });
    }
  } else {
    // // // console.log(`${colors.green}No vulnerabilities found in the codebase.${colors.reset}`);
  }
  
  // Check dependencies
  checkDependencies();
}

// Run the main function
main();
