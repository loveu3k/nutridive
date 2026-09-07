import fs from 'fs';
import path from 'path';
import type {
  Product,
  GenericHub,
  GenericSummary,
  CategoryDetail,
  DatabaseStats,
  SearchIndexItem,
} from './types';

const DATA_DIR = path.join(process.cwd(), 'data', 'processed');

// Cache search index in-memory for server calls
let searchIndexCache: SearchIndexItem[] | null = null;
let statsCache: DatabaseStats | null = null;
let categoriesCache: Record<string, CategoryDetail> | null = null;
let genericsCache: GenericSummary[] | null = null;

export async function getProduct(slug: string): Promise<Product | null> {
  const normalizedSlug = slug.toLowerCase().trim();
  const prefix = normalizedSlug.slice(0, 5);
  const filePath = path.join(DATA_DIR, 'products', prefix, `${normalizedSlug}.json`);

  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(content) as Product;
  } catch (err) {
    console.error(`Error reading product file: ${filePath}`, err);
    return null;
  }
}

export async function getGenericHub(slug: string): Promise<GenericHub | null> {
  const normalizedSlug = slug.toLowerCase().trim();
  const filePath = path.join(DATA_DIR, 'generic_map', `${normalizedSlug}.json`);

  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(content) as GenericHub;
  } catch (err) {
    console.error(`Error reading generic map: ${filePath}`, err);
    return null;
  }
}

export async function getTopGenerics(limit: number = 50): Promise<GenericSummary[]> {
  if (genericsCache) {
    return genericsCache.slice(0, limit);
  }

  const filePath = path.join(DATA_DIR, 'generics.json');
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const content = await fs.promises.readFile(filePath, 'utf-8');
    genericsCache = JSON.parse(content) as GenericSummary[];
    return genericsCache.slice(0, limit);
  } catch (err) {
    console.error(`Error reading generics.json:`, err);
    return [];
  }
}

export async function getCategories(): Promise<Record<string, CategoryDetail>> {
  if (categoriesCache) {
    return categoriesCache;
  }

  const filePath = path.join(DATA_DIR, 'categories.json');
  try {
    if (!fs.existsSync(filePath)) {
      return {};
    }
    const content = await fs.promises.readFile(filePath, 'utf-8');
    categoriesCache = JSON.parse(content) as Record<string, CategoryDetail>;
    return categoriesCache;
  } catch (err) {
    console.error(`Error reading categories.json:`, err);
    return {};
  }
}

export async function getStats(): Promise<DatabaseStats> {
  if (statsCache) {
    return statsCache;
  }

  const filePath = path.join(DATA_DIR, 'stats.json');
  try {
    if (!fs.existsSync(filePath)) {
      return {
        total_products: 28172,
        approved_count: 27882,
        conditional_count: 361,
        category_counts: {},
        total_generics: 5107,
        last_sync: new Date().toISOString().split('T')[0],
        source: 'National Pharmaceutical Regulatory Agency (NPRA), Ministry of Health Malaysia (KKM)',
        source_url: 'https://data.gov.my/data-catalogue/pharmaceutical_products',
        license: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
      };
    }
    const content = await fs.promises.readFile(filePath, 'utf-8');
    statsCache = JSON.parse(content) as DatabaseStats;
    return statsCache;
  } catch (err) {
    console.error(`Error reading stats.json:`, err);
    return {
      total_products: 28172,
      approved_count: 27882,
      conditional_count: 361,
      category_counts: {},
      total_generics: 5107,
      last_sync: new Date().toISOString().split('T')[0],
      source: 'NPRA Malaysia',
      source_url: '',
      license: 'CC BY 4.0',
    };
  }
}

export async function getSearchIndex(): Promise<SearchIndexItem[]> {
  if (searchIndexCache) {
    return searchIndexCache;
  }

  const filePath = path.join(DATA_DIR, 'search_index.json');
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const content = await fs.promises.readFile(filePath, 'utf-8');
    searchIndexCache = JSON.parse(content) as SearchIndexItem[];
    return searchIndexCache;
  } catch (err) {
    console.error(`Error reading search_index.json:`, err);
    return [];
  }
}

export async function searchProducts(
  query: string,
  limit: number = 20,
  categoryCode?: string
): Promise<SearchIndexItem[]> {
  const index = await getSearchIndex();
  const q = query.toLowerCase().trim();

  if (!q) {
    return [];
  }

  const matches: SearchIndexItem[] = [];
  for (const item of index) {
    // item: [slug, reg_no, product_name, category_code, generic_name, holder]
    const [slug, reg_no, name, catCode, genericName, holder] = item;

    if (categoryCode && catCode !== categoryCode.toUpperCase()) {
      continue;
    }

    const regNoLower = reg_no.toLowerCase();
    const nameLower = name.toLowerCase();
    const genericLower = genericName.toLowerCase();
    const holderLower = holder.toLowerCase();

    // Priority matching: starts with MAL, name match, or generic match
    if (
      regNoLower.includes(q) ||
      nameLower.includes(q) ||
      genericLower.includes(q) ||
      holderLower.includes(q)
    ) {
      matches.push(item);
      if (matches.length >= limit) {
        break;
      }
    }
  }

  return matches;
}
