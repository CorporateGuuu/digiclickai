import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export function loadProductsFromCSV() {
  try {
    // Path to your CSV file
    const filePath = path.join(process.cwd(), 'data', 'products.csv');
    
    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse the CSV content
    const records = parse(fileContent, {
      columns: true, // Treat the first line as headers
      skip_empty_lines: true
    });
    
    // Transform the data as needed
    const products = records.map(record => ({
      id: parseInt(record.id),
      name: record.name,
      category: record.category,
      price: parseFloat(record.price),
      originalPrice: record.originalPrice ? parseFloat(record.originalPrice) : null,
      imageUrl: record.image_url || '', // Match the field name in your existing CSV
      badge: record.badge || null,
      featured: record.is_featured === 'true' || record.is_featured === '1', // Match the field name in your existing CSV
      popular: record.is_new === 'true' || record.is_new === '1' // Using is_new as "popular" for this example
    }));
    
    return products;
  } catch (error) {
    console.error('Error loading products from CSV:', error);
    return [];
  }
}
