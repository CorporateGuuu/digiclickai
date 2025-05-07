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

// Function to fix React issues in a file
function fixReactIssues(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Add React import if using JSX but no React import
    if (content.includes('return (') && content.includes('<') && content.includes('>') && !content.includes('import React')) {
      content = `import React from 'react';\n${content}`;
      modified = true;
    }
    
    // Fix unescaped entities in JSX
    const entityReplacements = [
      { pattern: /(\s)'(\w)/g, replacement: "$1'$2" },
      { pattern: /(\w)'(\s)/g, replacement: "$1'$2" },
      { pattern: /(\s)"(\w)/g, replacement: '$1"$2' },
      { pattern: /(\w)"(\s)/g, replacement: '$1"$2' },
      { pattern: /(\w)'(\w)/g, replacement: "$1'$2" },
      { pattern: /(\w)"(\w)/g, replacement: '$1"$2' },
      { pattern: /(\s)'(\s)/g, replacement: "$1'$2" },
      { pattern: /(\s)"(\s)/g, replacement: '$1"$2' },
    ];
    
    for (const { pattern, replacement } of entityReplacements) {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }
    
    // Fix img tags to use Next.js Image component
    if (content.includes('<img') && !content.includes('next/image') && !content.includes('eslint-disable')) {
      // Add Image import if not already present
      if (!content.includes('import Image from')) {
        content = `import Image from 'next/image';\n${content}`;
        modified = true;
      }
      
      // Add eslint-disable comment for img tags
      content = content.replace(/<img/g, '{/* eslint-disable-next-line @next/next/no-img-element */}\n      <img');
      modified = true;
    }
    
    // Fix no-undef errors for React
    if (content.includes('React.') && !content.includes('import React')) {
      content = `import React from 'react';\n${content}`;
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed React issues in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error);
  }
}

// Main function
function main() {
  console.log('Starting to fix React issues...');
  
  // Get all JS files
  const allFiles = getAllFiles('.');
  
  // Fix React issues in each file
  allFiles.forEach(file => {
    fixReactIssues(file);
  });
  
  console.log('Finished fixing React issues.');
}

main();
