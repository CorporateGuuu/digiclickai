
import fs from 'fs';
import path from 'path';

// Helper function to read data from JSON files
function readJsonFile(filename: string) {
  const filePath = path.join(process.cwd(), '../mock_db/data', `${filename}.json`);
  const fileData = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileData);
}

// Get all products with optional pagination
export async function getProducts(page = 1, limit = 20, categorySlug?: string) {
  const products = readJsonFile('products');
  
  // Filter by category if provided
  const filteredProducts = categorySlug
    ? products.filter((p: any) => {
        const categories = readJsonFile('categories');
        const category = categories.find((c: any) => c.slug === categorySlug);
        return category && p.category_id === category.id;
      })
    : products;
  
  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return filteredProducts.slice(startIndex, endIndex);
}

// Get product by slug
export async function getProductBySlug(slug: string) {
  const products = readJsonFile('products');
  return products.find((p: any) => p.slug === slug) || null;
}

// Get all categories
export async function getCategories() {
  return readJsonFile('categories');
}

// Get category by slug
export async function getCategoryBySlug(slug: string) {
  const categories = readJsonFile('categories');
  return categories.find((c: any) => c.slug === slug) || null;
}

// Get featured products
export async function getFeaturedProducts(limit = 8) {
  const products = readJsonFile('products');
  return products
    .filter((p: any) => p.is_featured)
    .slice(0, limit);
}

// Get new products
export async function getNewProducts(limit = 8) {
  const products = readJsonFile('products');
  return products
    .filter((p: any) => p.is_new)
    .slice(0, limit);
}
