#!/usr/bin/env python3
"""
Simplified setup script that creates a mock database structure
and demonstrates the data flow without requiring PostgreSQL.
"""

import os
import json
import csv
import sys
from datetime import datetime

# Create necessary directories
os.makedirs('mock_db/data', exist_ok=True)

# Mock database tables
tables = {
    'products': [],
    'categories': [],
    'users': [],
    'orders': []
}

# Sample categories
categories = [
    {
        'id': 1,
        'name': 'Smartphones',
        'slug': 'smartphones',
        'description': 'Latest smartphones and mobile devices',
        'image_url': '/placeholder.svg?height=400&width=300',
        'product_count': 24
    },
    {
        'id': 2,
        'name': 'Audio',
        'slug': 'audio',
        'description': 'Headphones, earbuds, and speakers',
        'image_url': '/placeholder.svg?height=400&width=300',
        'product_count': 18
    },
    {
        'id': 3,
        'name': 'Accessories',
        'slug': 'accessories',
        'description': 'Cases, chargers, and other accessories',
        'image_url': '/placeholder.svg?height=400&width=300',
        'product_count': 36
    },
    {
        'id': 4,
        'name': 'Wearables',
        'slug': 'wearables',
        'description': 'Smartwatches and fitness trackers',
        'image_url': '/placeholder.svg?height=400&width=300',
        'product_count': 12
    }
]

# Sample products
products = [
    {
        'id': 1,
        'name': 'Quantum Pro X',
        'slug': 'quantum-pro-x',
        'price': 1299.99,
        'description': 'The latest flagship smartphone with advanced features',
        'image_url': '/placeholder.svg?height=300&width=300',
        'category_id': 1,
        'category_name': 'Smartphones',
        'is_featured': True,
        'is_new': True,
        'stock_quantity': 50,
        'brand': 'TechX'
    },
    {
        'id': 2,
        'name': 'Elite Wireless Earbuds',
        'slug': 'elite-wireless-earbuds',
        'price': 249.99,
        'description': 'Premium wireless earbuds with noise cancellation',
        'image_url': '/placeholder.svg?height=300&width=300',
        'category_id': 2,
        'category_name': 'Audio',
        'is_featured': True,
        'is_new': False,
        'stock_quantity': 100,
        'brand': 'SoundMaster'
    },
    {
        'id': 3,
        'name': 'PowerMax Charging Dock',
        'slug': 'powermax-charging-dock',
        'price': 89.99,
        'description': 'Fast charging dock for multiple devices',
        'image_url': '/placeholder.svg?height=300&width=300',
        'category_id': 3,
        'category_name': 'Accessories',
        'is_featured': True,
        'is_new': False,
        'stock_quantity': 200,
        'brand': 'PowerTech'
    },
    {
        'id': 4,
        'name': 'Titanium Phone Case',
        'slug': 'titanium-phone-case',
        'price': 59.99,
        'description': 'Durable titanium case for ultimate protection',
        'image_url': '/placeholder.svg?height=300&width=300',
        'category_id': 3,
        'category_name': 'Accessories',
        'is_featured': True,
        'is_new': True,
        'stock_quantity': 150,
        'brand': 'ArmorTech'
    },
    {
        'id': 5,
        'name': 'SmartWatch Pro',
        'slug': 'smartwatch-pro',
        'price': 349.99,
        'description': 'Advanced smartwatch with health monitoring',
        'image_url': '/placeholder.svg?height=300&width=300',
        'category_id': 4,
        'category_name': 'Wearables',
        'is_featured': False,
        'is_new': True,
        'stock_quantity': 75,
        'brand': 'FitTech'
    }
]

# Add data to tables
tables['categories'] = categories
tables['products'] = products

# Save data to JSON files
for table_name, data in tables.items():
    with open(f'mock_db/data/{table_name}.json', 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Created {table_name} table with {len(data)} records")

# Create a simple API endpoint for the frontend
os.makedirs('phone-electronics-store/app/api/mock', exist_ok=True)

# Create mock API endpoints
api_endpoints = [
    {
        'path': 'phone-electronics-store/app/api/mock/products/route.ts',
        'content': '''
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured') === 'true';
    
    // Read products from JSON file
    const productsPath = path.join(process.cwd(), '../mock_db/data/products.json');
    const productsData = fs.readFileSync(productsPath, 'utf8');
    const products = JSON.parse(productsData);
    
    // Filter products if needed
    const filteredProducts = featured 
      ? products.filter((product: any) => product.is_featured) 
      : products;
    
    return NextResponse.json({ products: filteredProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
'''
    },
    {
        'path': 'phone-electronics-store/app/api/mock/categories/route.ts',
        'content': '''
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Read categories from JSON file
    const categoriesPath = path.join(process.cwd(), '../mock_db/data/categories.json');
    const categoriesData = fs.readFileSync(categoriesPath, 'utf8');
    const categories = JSON.parse(categoriesData);
    
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
'''
    }
]

# Create API endpoint files
for endpoint in api_endpoints:
    os.makedirs(os.path.dirname(endpoint['path']), exist_ok=True)
    with open(endpoint['path'], 'w') as f:
        f.write(endpoint['content'])
    print(f"Created API endpoint: {endpoint['path']}")

# Create a simplified db.ts file for the frontend
db_ts_path = 'phone-electronics-store/lib/mock-db.ts'
os.makedirs(os.path.dirname(db_ts_path), exist_ok=True)

db_ts_content = '''
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
'''

with open(db_ts_path, 'w') as f:
    f.write(db_ts_content)
print(f"Created mock database utility: {db_ts_path}")

# Update the home page to use the mock database
home_page_path = 'phone-electronics-store/app/page.tsx'
if os.path.exists(home_page_path):
    with open(home_page_path, 'r') as f:
        content = f.read()
    
    # Replace the import statement
    updated_content = content.replace(
        "import { getFeaturedProducts, getCategories } from \"@/lib/db\"",
        "import { getFeaturedProducts, getCategories } from \"@/lib/mock-db\""
    )
    
    with open(home_page_path, 'w') as f:
        f.write(updated_content)
    print(f"Updated home page to use mock database")

print("\nSimplified setup completed successfully!")
print("You can now run the frontend with:")
print("cd phone-electronics-store && npm run dev")
