import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

const baseUrl = 'https://nutridive.net';

interface DrugEntry {
  slug: string;
  hasSpecialDiet: boolean;
}

interface PairEntry {
  slug: string;
  priority?: number;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/drugs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/interactions`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // 1. Ingest all Drug monographs
  try {
    const dataFilePath = path.join(process.cwd(), 'data/rules/medline_dietary_rules.json');
    if (fs.existsSync(dataFilePath)) {
      const raw = fs.readFileSync(dataFilePath, 'utf-8');
      const drugs: DrugEntry[] = JSON.parse(raw);

      drugs.forEach((drug) => {
        if (drug.slug) {
          routes.push({
            url: `${baseUrl}/drugs/${drug.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: drug.hasSpecialDiet ? 0.8 : 0.6,
          });
        }
      });
    }
  } catch {
    // Fallback gracefully
  }

  // 2. Ingest all Pairwise Interactions
  try {
    const pairFilePath = path.join(process.cwd(), 'data/rules/interaction_pairs.json');
    if (fs.existsSync(pairFilePath)) {
      const raw = fs.readFileSync(pairFilePath, 'utf-8');
      const pairs: PairEntry[] = JSON.parse(raw);

      pairs.forEach((pair) => {
        if (pair.slug) {
          routes.push({
            url: `${baseUrl}/interactions/${pair.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: pair.priority || 0.75,
          });
        }
      });
    }
  } catch {
    // Fallback gracefully
  }

  return routes;
}
