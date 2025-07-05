const path = require('path');
const fs = require('fs');
const { importCsvData } = require('./setup');

// Define column mappings for normalized CSV files
const columnMappings = {
  products: {
    'id': 'id',
    'name': 'name',
    'slug': 'slug',
    'sku': 'sku',
    'description': 'description',
    'price': 'price',
    'discount_percentage': 'discount_percentage',
    'stock_quantity': 'stock_quantity',
    'is_featured': 'is_featured',
    'is_new': 'is_new',
    'image_url': 'image_url',
    'weight': 'weight',
    'dimensions': 'dimensions',
    'category_id': 'category_id',
    'brand': 'brand'
  },
  categories: {
    'id': 'id',
    'name': 'name',
    'slug': 'slug',
    'description': 'description',
    'image_url': 'image_url',
    'parent_id': 'parent_id'
  },
  product_specifications: {
    'id': 'id',
    'product_id': 'product_id',
    'display': 'display',
    'processor': 'processor',
    'memory': 'memory',
    'storage': 'storage',
    'camera': 'camera',
    'battery': 'battery',
    'connectivity': 'connectivity',
    'operating_system': 'operating_system',
    'additional_features': 'additional_features'
  },
  product_variants: {
    'id': 'id',
    'product_id': 'product_id',
    'variant_type': 'variant_type',
    'variant_value': 'variant_value',
    'price_adjustment': 'price_adjustment',
    'stock_quantity': 'stock_quantity',
    'sku': 'sku'
  }
};

// Main function to run the import
async function runImport() {
  try {
    // Define path to normalized data directory
    const normalizedDataDir = path.join(__dirname, 'data/normalized');

    // Check if normalized data directory exists
    if (!fs.existsSync(normalizedDataDir)) {
      console.error(`Normalized data directory not found: ${normalizedDataDir}`);
      // // // console.log('Please run the data conversion and normalization scripts first:');
      // // // console.log('1. python3 database/convert_excel_to_csv.py');
      // // // console.log('2. python3 database/merge_data.py');
      return;
    }

    // Import data in the correct order (categories first, then products, etc.)
    const importOrder = ['categories', 'products', 'product_specifications', 'product_variants'];

    for (const table of importOrder) {
      const csvPath = path.join(normalizedDataDir, `${table}.csv`);

      // Check if file exists
      if (fs.existsSync(csvPath)) {
        // // // console.log(`Importing data into ${table} table...`);
        await importCsvData(csvPath, table, columnMappings[table]);
      } else {
        // // // console.log(`No data file found for ${table} table.`);
      }
    }

    // // // console.log('CSV import completed successfully');
  } catch (error) {
    console.error('Error during CSV import:', error);
  }
}

// Run the import if this script is executed directly
if (require.main === module) {
  runImport().catch(console.error);
}

module.exports = {
  runImport
};
