import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/data';
import type { Product } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slugsParam = searchParams.get('slugs') || '';

  if (!slugsParam.trim()) {
    return NextResponse.json({ products: [] });
  }

  const slugs = slugsParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4); // Max 4 products for comparison

  const products: Product[] = [];
  for (const slug of slugs) {
    const product = await getProduct(slug);
    if (product) {
      products.push(product);
    }
  }

  return NextResponse.json(
    { products },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  );
}
