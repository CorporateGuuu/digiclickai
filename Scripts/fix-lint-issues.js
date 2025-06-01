const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.next')) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      }
    } else {
      if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        arrayOfFiles.push(filePath);
      }
    }
  });

  return arrayOfFiles;
}

// Function to fix common ESLint issues
function fixCommonIssues(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix unescaped entities
    content = content.replace(/(\s)'(\w)/g, '$1'$2');
    content = content.replace(/(\w)'(\s)/g, '$1'$2');
    content = content.replace(/(\s)"(\w)/g, '$1"$2');
    content = content.replace(/(\w)"(\s)/g, '$1"$2');
    
    // Fix img tags to use Next.js Image component
    if (content.includes('<img') && !content.includes('next/image')) {
      content = `import Image from 'next/image';\n${content}`;
    }
    
    // Fix a tags to use Next.js Link component
    if (content.includes('<Link href="/') && !content.includes('next/link')) {
      content = `import Link from 'next/link';\n${content}`;
    }
    
    // Replace <a> with <Link> for internal links
    content = content.replace(/<a href="\/([^"]+)"([^>]*)>/g, '<Link href="/$1"$2>');
    content = content.replace(/<\/a>/g, '</Link>');
    
    // Fix console statements
    content = content.replace(/console\.log\(/g, '// // // // console.log(');
    
    fs.writeFileSync(filePath, content, 'utf8');
    // // // console.log(`Fixed common issues in ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error);
  }
}

// Main function
function main() {
  // // // console.log('Starting to fix common ESLint issues...');
  
  // Get all JS files
  const allFiles = getAllFiles('.');
  
  // Fix common issues in each file
  allFiles.forEach(file => {
    fixCommonIssues(file);
  });
  
  // // // console.log('Finished fixing common ESLint issues.');
}

main();
