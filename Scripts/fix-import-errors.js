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

// Function to fix import errors
function fixImportErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix escaped quotes in import statements
    content = content.replace(/import\s+([^'"]*?)'([^'"]*?)'/g, "import $1'$2'");
    content = content.replace(/import\s+([^'"]*?)"([^'"]*?)"/g, 'import $1"$2"');
    
    // Fix from statements
    content = content.replace(/from\s+'([^'"]*?)'/g, "from '$1'");
    content = content.replace(/from\s+"([^'"]*?)"/g, 'from "$1"');
    
    // Fix require statements
    content = content.replace(/require\('([^'"]*?)'\)/g, "require('$1')");
    content = content.replace(/require\("([^'"]*?)"\)/g, 'require("$1")');
    
    fs.writeFileSync(filePath, content, 'utf8');
    // console.log(`Fixed import errors in ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error);
  }
}

// Main function
function main() {
  // console.log('Starting to fix import errors...');
  
  // Get all JS files
  const allFiles = getAllFiles('.');
  
  // Fix import errors in each file
  allFiles.forEach(file => {
    fixImportErrors(file);
  });
  
  // console.log('Finished fixing import errors.');
}

main();
