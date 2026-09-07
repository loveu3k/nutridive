import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/data';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limitParam = searchParams.get('limit');
  const cat = searchParams.get('cat') || undefined;

  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10), 1), 50) : 20;

  if (!q.trim()) {
    return NextResponse.json({ results: [], total: 0 });
  }

  const results = await searchProducts(q, limit, cat);

  const formatted = results.map(([slug, reg_no, name, catCode, genericName, holder]) => ({
    slug,
    reg_no,
    product_name: name,
    category_code: catCode,
    generic_name: genericName,
    holder,
  }));

  return NextResponse.json(
    {
      results: formatted,
      total: formatted.length,
      query: q,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  );
}
