const fs = require('fs');
const path = require('path');

// Function to recursively get all JS files in a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (filePath.endsWith('.js') && !filePath.includes('node_modules') && !filePath.includes('_app.js')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Function to check if a file is a page component
function isPageComponent(filePath) {
  // Check if the file is in the pages directory
  return true; // For now, consider all files as page components
}

// Function to check if a file uses the Layout component
function checkLayoutUsage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check if the file imports Layout
    const importsLayout = content.includes('import Layout from');

    // Check if the file uses Layout component
    const usesLayout = content.includes('<Layout');

    // Check if the file is a page component
    const isPage = isPageComponent(filePath);

    console.log(`Checking file: ${filePath}`);
    console.log(`  Is page component: ${isPage}`);
    console.log(`  Imports Layout: ${importsLayout}`);
    console.log(`  Uses Layout: ${usesLayout}`);

    if (isPage && !importsLayout && !usesLayout) {
      console.log(`  WARNING: Page ${filePath} does not use Layout component`);
    } else if (importsLayout && !usesLayout) {
      console.log(`  INFO: File ${filePath} imports Layout but doesn't use it`);
    } else if (isPage && importsLayout && usesLayout) {
      console.log(`  SUCCESS: Page ${filePath} correctly uses Layout component`);
    }
    console.log('---');
  } catch (error) {
    console.error(`Error checking ${filePath}:`, error);
  }
}

// Main function
function main() {
  console.log('Checking Layout component usage in pages...');

  // Get all JS files in pages directory
  const pageFiles = getAllFiles('./pages').filter(file =>
    !file.includes('_app.js') &&
    !file.includes('_document.js') &&
    !file.includes('_error.js') &&
    !file.includes('/api/')
  );

  console.log(`Found ${pageFiles.length} page files to check`);

  // Check each file
  pageFiles.forEach(file => {
    checkLayoutUsage(file);
  });

  console.log('Finished checking Layout component usage.');
}

main();
