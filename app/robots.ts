import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: ['Googlebot', 'Bingbot', 'PerplexityBot', 'GPTBot', 'ClaudeBot', 'Applebot'],
        allow: '/',
      },
    ],
    sitemap: 'https://nutridive.net/sitemap.xml',
  };
}
