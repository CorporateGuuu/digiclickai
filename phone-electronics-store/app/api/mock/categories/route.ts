
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
