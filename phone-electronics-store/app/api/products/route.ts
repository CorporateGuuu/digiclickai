import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getFeaturedProducts, getNewProducts } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category') || undefined;
    const featured = searchParams.get('featured') === 'true';
    const newProducts = searchParams.get('new') === 'true';
    
    let products;
    
    if (featured) {
      products = await getFeaturedProducts(limit);
    } else if (newProducts) {
      products = await getNewProducts(limit);
    } else {
      products = await getProducts(page, limit, category);
    }
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
