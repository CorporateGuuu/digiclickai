
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
