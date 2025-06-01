const fs = require('fs');
const path = require('path');

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

// Function to update files to use Layout component
function updateToUseLayout(filePath) {
  try {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file imports Header and Footer
    const importsHeader = content.includes("import Header from '../components/Header/Header'");
    const importsFooter = content.includes("import Footer from '../components/Footer/Footer'");
    
    // Only update if both Header and Footer are imported
    if (importsHeader && importsFooter) {
      console.log(`Updating ${filePath} to use Layout component`);
      
      // Replace Header and Footer imports with Layout import
      content = content.replace(
        /import Header from ['"]\.\.\/components\/Header\/Header['"];?\s*import Footer from ['"]\.\.\/components\/Footer\/Footer['"];?/g,
        "import Layout from '../components/Layout/Layout';"
      );
      
      // Replace Header and Footer components with Layout component
      content = content.replace(
        /<Header\s*\/>\s*<main[^>]*>([\s\S]*?)<\/main>\s*<Footer\s*\/>/g,
        (match, mainContent) => {
          // Extract title and description from Head component if present
          const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/);
          const descriptionMatch = content.match(/<meta name="description" content="([^"]*)".*?\/>/);
          
          const title = titleMatch ? titleMatch[1] : '';
          const description = descriptionMatch ? descriptionMatch[1] : '';
          
          return `<Layout title="${title}" description="${description}">\n${mainContent}\n</Layout>`;
        }
      );
      
      // Write updated content back to file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

// Main function
function main() {
  console.log('Starting to update files to use Layout component...');
  
  // Get all JS files in pages directory
  const allFiles = getAllFiles('./pages');
  
  // Update each file
  allFiles.forEach(file => {
    updateToUseLayout(file);
  });
  
  console.log('Finished updating files.');
}

main();
