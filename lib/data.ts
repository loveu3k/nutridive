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

// Cache loaded chunks in-memory for lightning-fast lookups (<0.01ms)
const productChunkCache: Record<string, Record<string, Product>> = {};
const genericChunkCache: Record<string, Record<string, GenericHub>> = {};
let searchIndexCache: SearchIndexItem[] | null = null;
let statsCache: DatabaseStats | null = null;
let categoriesCache: Record<string, CategoryDetail> | null = null;
let genericsCache: GenericSummary[] | null = null;

let productImagesCache: Record<string, string> | null = null;

async function getProductImagesMap(): Promise<Record<string, string>> {
  if (productImagesCache) return productImagesCache;
  const filePath = path.join(DATA_DIR, 'product_images.json');
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    productImagesCache = JSON.parse(content);
    return productImagesCache || {};
  } catch {
    productImagesCache = {};
    return productImagesCache;
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  const normalizedSlug = slug.toLowerCase().trim();
  const prefix = normalizedSlug.slice(0, 5);

  let product: Product | null = null;

  // 1. Check in-memory chunk cache
  if (productChunkCache[prefix]) {
    product = productChunkCache[prefix][normalizedSlug] || null;
  } else {
    // 2. Read from compact chunk file
    const chunkPath = path.join(DATA_DIR, 'product_chunks', `${prefix}.json`);
    try {
      const content = await fs.promises.readFile(chunkPath, 'utf-8');
      const chunk = JSON.parse(content) as Record<string, Product>;
      productChunkCache[prefix] = chunk;
      product = chunk[normalizedSlug] || null;
    } catch {
      // Fallback to legacy individual file if chunk is missing
      try {
        const filePath = path.join(DATA_DIR, 'products', prefix, `${normalizedSlug}.json`);
        const content = await fs.promises.readFile(filePath, 'utf-8');
        product = JSON.parse(content) as Product;
      } catch {
        product = null;
      }
    }
  }

  if (product && !product.image_url) {
    const imagesMap = await getProductImagesMap();
    const mappedUrl =
      imagesMap[normalizedSlug] ||
      (product.reg_no ? imagesMap[product.reg_no.toLowerCase()] : null);
    if (mappedUrl) {
      product.image_url = mappedUrl;
    }
  }

  return product;
}

export async function getGenericHub(slug: string): Promise<GenericHub | null> {
  const normalizedSlug = slug.toLowerCase().trim();
  const firstChar = normalizedSlug.charAt(0) || 'a';
  const chunkKey = /^[a-z]$/.test(firstChar) ? firstChar : 'other';

  // 1. Check in-memory chunk cache
  if (genericChunkCache[chunkKey]) {
    return genericChunkCache[chunkKey][normalizedSlug] || null;
  }

  // 2. Read from compact generic chunk file
  const chunkPath = path.join(DATA_DIR, 'generic_chunks', `${chunkKey}.json`);
  try {
    const content = await fs.promises.readFile(chunkPath, 'utf-8');
    const chunk = JSON.parse(content) as Record<string, GenericHub>;
    genericChunkCache[chunkKey] = chunk;
    return chunk[normalizedSlug] || null;
  } catch {
    // Fallback to legacy individual file if chunk is missing
    try {
      const filePath = path.join(DATA_DIR, 'generic_map', `${normalizedSlug}.json`);
      const content = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(content) as GenericHub;
    } catch {
      return null;
    }
  }
}

export async function getTopGenerics(limit: number = 50): Promise<GenericSummary[]> {
  if (genericsCache && genericsCache.length >= limit) {
    return genericsCache.slice(0, limit);
  }

  const filename = limit <= 50 ? 'generics_top50.json' : 'generics.json';
  const filePath = path.join(DATA_DIR, filename);
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const data = JSON.parse(content) as GenericSummary[];
    if (limit > 50) {
      genericsCache = data;
    }
    return data.slice(0, limit);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return [];
  }
}

export async function getAllGenerics(): Promise<GenericSummary[]> {
  if (genericsCache && genericsCache.length > 50) {
    return genericsCache;
  }
  const filePath = path.join(DATA_DIR, 'generics.json');
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const data = JSON.parse(content) as GenericSummary[];
    genericsCache = data;
    return data;
  } catch (err) {
    console.error('Error reading generics.json:', err);
    return [];
  }
}

export async function getCategories(): Promise<Record<string, CategoryDetail>> {
  if (categoriesCache) {
    return categoriesCache;
  }

  const filePath = path.join(DATA_DIR, 'categories.json');
  try {
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
    const content = await fs.promises.readFile(filePath, 'utf-8');
    statsCache = JSON.parse(content) as DatabaseStats;
    return statsCache;
  } catch {
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
}

export async function getCategoryProducts(slug: string): Promise<SearchIndexItem[]> {
  const normalizedSlug = slug.toLowerCase().trim();
  const filePath = path.join(DATA_DIR, 'category_items', `${normalizedSlug}.json`);

  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(content) as SearchIndexItem[];
  } catch {
    // Graceful fallback: filter from full search index if partition is missing
    const categories = await getCategories();
    const cat = categories[normalizedSlug];
    if (!cat) return [];
    const index = await getSearchIndex();
    return index.filter((item) => item[3] === cat.code);
  }
}

export async function getSearchIndex(): Promise<SearchIndexItem[]> {
  if (searchIndexCache) {
    return searchIndexCache;
  }

  const filePath = path.join(DATA_DIR, 'search_index.json');
  try {
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
