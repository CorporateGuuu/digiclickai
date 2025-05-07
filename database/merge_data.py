#!/usr/bin/env python3
"""
Script to merge and normalize CSV data for database import.
This script processes CSV files in the database/data directory,
merges related data, and creates normalized CSV files for each database table.
"""

import os
import sys
import pandas as pd
import glob
import re
import json

# Define paths
DATA_DIR = "database/data"
OUTPUT_DIR = "database/data/normalized"

# Define table schemas
TABLES = {
    "products": [
        "id", "name", "slug", "sku", "description", "price", "discount_percentage",
        "stock_quantity", "is_featured", "is_new", "image_url", "weight",
        "dimensions", "category_id", "brand"
    ],
    "product_specifications": [
        "id", "product_id", "display", "processor", "memory", "storage",
        "camera", "battery", "connectivity", "operating_system", "additional_features"
    ],
    "categories": [
        "id", "name", "slug", "description", "image_url", "parent_id"
    ],
    "product_variants": [
        "id", "product_id", "variant_type", "variant_value", 
        "price_adjustment", "stock_quantity", "sku"
    ]
}

def create_slug(name):
    """Create a URL-friendly slug from a name."""
    if not name or not isinstance(name, str):
        return ""
    # Convert to lowercase and replace spaces with hyphens
    slug = name.lower().strip()
    # Remove special characters
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    # Replace spaces with hyphens
    slug = re.sub(r'\s+', '-', slug)
    # Remove multiple hyphens
    slug = re.sub(r'-+', '-', slug)
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    return slug

def normalize_product_data(csv_files):
    """Process and normalize product data from CSV files."""
    # Create empty DataFrames for each table
    products_df = pd.DataFrame(columns=TABLES["products"])
    specs_df = pd.DataFrame(columns=TABLES["product_specifications"])
    categories_df = pd.DataFrame(columns=TABLES["categories"])
    variants_df = pd.DataFrame(columns=TABLES["product_variants"])
    
    # Track unique categories and products
    categories = {}
    products = {}
    
    # Process each CSV file
    for csv_file in csv_files:
        try:
            # Read CSV file
            df = pd.read_csv(csv_file)
            
            # Skip empty files
            if df.empty:
                continue
                
            # Normalize column names
            df.columns = [col.lower().strip() for col in df.columns]
            
            # Map common column names
            column_mapping = {
                'title': 'name',
                'product name': 'name',
                'product_name': 'name',
                'product': 'name',
                'cost': 'price',
                'product price': 'price',
                'product_price': 'price',
                'image': 'image_url',
                'img': 'image_url',
                'image url': 'image_url',
                'image_url': 'image_url',
                'desc': 'description',
                'product description': 'description',
                'product_description': 'description',
                'category name': 'category',
                'category_name': 'category',
                'stock': 'stock_quantity',
                'quantity': 'stock_quantity',
                'inventory': 'stock_quantity'
            }
            
            # Rename columns based on mapping
            for old_col, new_col in column_mapping.items():
                if old_col in df.columns:
                    df.rename(columns={old_col: new_col}, inplace=True)
            
            # Extract product data
            for _, row in df.iterrows():
                # Skip rows without a name
                if 'name' not in row or pd.isna(row['name']):
                    continue
                
                # Create product data
                product_data = {
                    'name': row.get('name', ''),
                    'slug': create_slug(row.get('name', '')),
                    'sku': row.get('sku', f"SKU-{len(products) + 1}"),
                    'description': row.get('description', ''),
                    'price': float(row.get('price', 0)) if not pd.isna(row.get('price', 0)) else 0,
                    'discount_percentage': float(row.get('discount', 0)) if not pd.isna(row.get('discount', 0)) else 0,
                    'stock_quantity': int(row.get('stock_quantity', 10)) if not pd.isna(row.get('stock_quantity', 10)) else 10,
                    'is_featured': bool(row.get('featured', False)),
                    'is_new': bool(row.get('new', False)),
                    'image_url': row.get('image_url', ''),
                    'weight': float(row.get('weight', 0)) if not pd.isna(row.get('weight', 0)) else 0,
                    'dimensions': row.get('dimensions', ''),
                    'brand': row.get('brand', '')
                }
                
                # Extract category
                category_name = row.get('category', 'Uncategorized')
                if not pd.isna(category_name) and category_name:
                    if category_name not in categories:
                        category_id = len(categories) + 1
                        categories[category_name] = {
                            'id': category_id,
                            'name': category_name,
                            'slug': create_slug(category_name),
                            'description': '',
                            'image_url': '',
                            'parent_id': None
                        }
                    product_data['category_id'] = categories[category_name]['id']
                
                # Generate product ID
                product_id = len(products) + 1
                product_data['id'] = product_id
                products[product_id] = product_data
                
                # Extract specifications
                spec_fields = {
                    'display': row.get('display', ''),
                    'processor': row.get('processor', ''),
                    'memory': row.get('memory', ''),
                    'storage': row.get('storage', ''),
                    'camera': row.get('camera', ''),
                    'battery': row.get('battery', ''),
                    'connectivity': row.get('connectivity', ''),
                    'operating_system': row.get('os', ''),
                    'additional_features': row.get('features', '')
                }
                
                # Only add specifications if at least one field has data
                if any(not pd.isna(v) and v for v in spec_fields.values()):
                    spec_data = {
                        'id': len(specs_df) + 1,
                        'product_id': product_id,
                        **spec_fields
                    }
                    specs_df = pd.concat([specs_df, pd.DataFrame([spec_data])], ignore_index=True)
                
                # Extract variants
                variant_columns = [col for col in df.columns if 'variant' in col.lower()]
                if variant_columns:
                    for variant_col in variant_columns:
                        variant_value = row.get(variant_col)
                        if not pd.isna(variant_value) and variant_value:
                            variant_type = variant_col.replace('variant_', '').replace('variant', '')
                            variant_data = {
                                'id': len(variants_df) + 1,
                                'product_id': product_id,
                                'variant_type': variant_type,
                                'variant_value': str(variant_value),
                                'price_adjustment': float(row.get(f'{variant_col}_price', 0)) if not pd.isna(row.get(f'{variant_col}_price', 0)) else 0,
                                'stock_quantity': int(row.get(f'{variant_col}_stock', 10)) if not pd.isna(row.get(f'{variant_col}_stock', 10)) else 10,
                                'sku': f"{product_data['sku']}-{variant_type}-{variant_value}"
                            }
                            variants_df = pd.concat([variants_df, pd.DataFrame([variant_data])], ignore_index=True)
        
        except Exception as e:
            print(f"Error processing {csv_file}: {str(e)}")
    
    # Convert products dictionary to DataFrame
    products_df = pd.DataFrame(list(products.values()))
    
    # Convert categories dictionary to DataFrame
    categories_df = pd.DataFrame(list(categories.values()))
    
    return {
        'products': products_df,
        'product_specifications': specs_df,
        'categories': categories_df,
        'product_variants': variants_df
    }

def save_normalized_data(data_dict, output_dir):
    """Save normalized data to CSV files."""
    os.makedirs(output_dir, exist_ok=True)
    
    for table_name, df in data_dict.items():
        if not df.empty:
            output_path = os.path.join(output_dir, f"{table_name}.csv")
            df.to_csv(output_path, index=False)
            print(f"Saved {len(df)} records to {output_path}")
    
    # Create a metadata file with table information
    metadata = {
        'tables': {},
        'total_records': 0
    }
    
    for table_name, df in data_dict.items():
        metadata['tables'][table_name] = len(df)
        metadata['total_records'] += len(df)
    
    metadata_path = os.path.join(output_dir, "metadata.json")
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"Saved metadata to {metadata_path}")

def main():
    """Main function to process and merge CSV data."""
    print("Merging and normalizing CSV data...")
    
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Get all CSV files
    csv_files = glob.glob(os.path.join(DATA_DIR, "*.csv"))
    
    if not csv_files:
        print("No CSV files found in the data directory.")
        return
    
    print(f"Found {len(csv_files)} CSV files to process.")
    
    # Normalize data
    normalized_data = normalize_product_data(csv_files)
    
    # Save normalized data
    save_normalized_data(normalized_data, OUTPUT_DIR)
    
    print("\nData normalization complete.")
    print(f"Normalized data is stored in: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
