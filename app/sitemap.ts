import { MetadataRoute } from 'next';
import { getCategories, getAllGenerics, getSearchIndex } from '@/lib/data';

const baseUrl = 'https://nutridive.net';
const PRODUCTS_PER_SITEMAP = 10000;

// Generate sitemaps dynamically for comprehensive search engine indexing
// id 0: static pages, categories, and all 4,974+ generic molecule hubs
// id 1: products 0 to 9,999
// id 2: products 10,000 to 19,999
// id 3: products 20,000+ (covers all 28,316+ approved MAL products)
export async function generateSitemaps() {
  const index = await getSearchIndex();
  const productSitemapCount = Math.max(1, Math.ceil(index.length / PRODUCTS_PER_SITEMAP));

  const sitemaps = [{ id: 0 }];
  for (let i = 0; i < productSitemapCount; i++) {
    sitemaps.push({ id: i + 1 });
  }
  return sitemaps;
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const sitemapId = Number(id);

  if (sitemapId === 0) {
    const routes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ];

    // All categories
    const categories = await getCategories();
    for (const cat of Object.values(categories)) {
      routes.push({
        url: `${baseUrl}/category/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    // All 4,974+ generic molecule hubs
    const generics = await getAllGenerics();
    for (const gen of generics) {
      routes.push({
        url: `${baseUrl}/generic/${gen.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    return routes;
  }

  // Product chunks
  const index = await getSearchIndex();
  const chunkIndex = sitemapId - 1;
  const start = chunkIndex * PRODUCTS_PER_SITEMAP;
  const end = start + PRODUCTS_PER_SITEMAP;
  const productSlice = index.slice(start, end);

  return productSlice.map(([slug]) => ({
    url: `${baseUrl}/mal/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));
}
