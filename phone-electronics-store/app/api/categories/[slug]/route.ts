import { NextRequest, NextResponse } from 'next/server';
import { getCategoryBySlug, getProducts } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Category slug is required' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Get category details
    const category = await getCategoryBySlug(slug);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Get products in this category
    const products = await getProducts(page, limit, slug);
    
    return NextResponse.json({ 
      category,
      products,
      pagination: {
        page,
        limit,
        total: category.product_count,
        totalPages: Math.ceil(category.product_count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}
