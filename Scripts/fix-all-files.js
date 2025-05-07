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

// Function to fix all issues in a file
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix escaped quotes in all contexts
    content = content.replace(/'/g, "'");
    content = content.replace(/"/g, '"');
    
    // Fix unescaped entities in JSX
    content = content.replace(/(\s)'(\w)/g, "$1'$2");
    content = content.replace(/(\w)'(\s)/g, "$1'$2");
    content = content.replace(/(\s)"(\w)/g, '$1"$2');
    content = content.replace(/(\w)"(\s)/g, '$1"$2');
    
    // Fix console statements
    content = content.replace(/console\.log\(/g, "// // console.log(");
    
    fs.writeFileSync(filePath, content, 'utf8');
    // console.log(`Fixed ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error);
  }
}

// Main function
function main() {
  // console.log('Starting to fix all files...');
  
  // Get all JS files
  const allFiles = getAllFiles('.');
  
  // Fix all files
  allFiles.forEach(file => {
    fixFile(file);
  });
  
  // console.log('Finished fixing all files.');
}

main();
