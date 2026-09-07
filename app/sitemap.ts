import { MetadataRoute } from 'next';
import { getCategories, getTopGenerics, getSearchIndex } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nutridive.net';

  // Static routes
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

  // Category routes
  const categories = await getCategories();
  for (const cat of Object.values(categories)) {
    routes.push({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // Top generic molecules routes
  const topGenerics = await getTopGenerics(100);
  for (const gen of topGenerics) {
    routes.push({
      url: `${baseUrl}/generic/${gen.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // Top products from search index (top 1,000 for primary sitemap)
  const index = await getSearchIndex();
  const topProducts = index.slice(0, 1000);
  for (const [slug] of topProducts) {
    routes.push({
      url: `${baseUrl}/mal/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return routes;
}
