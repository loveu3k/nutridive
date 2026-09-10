export type CategoryCode = 'A' | 'X' | 'N' | 'T' | 'V' | 'H' | 'O';
export type CategorySlug = 'prescription' | 'otc' | 'supplement' | 'traditional' | 'veterinary' | 'homeopathic' | 'general';

export interface CategoryInfo {
  code: CategoryCode;
  slug: CategorySlug;
  name: string;
  short: string;
  description: string;
  badge_color?: string;
}

export interface ActiveIngredient {
  name: string;
  dosage: string;
}

export interface Product {
  slug: string;
  reg_no: string;
  product_name: string;
  status: string;
  category: CategoryInfo;
  holder: string;
  manufacturer: string;
  importer: string | null;
  date_reg: string | null;
  date_end: string | null;
  active_ingredients: ActiveIngredient[];
  generic_name: string;
  generic_slug: string;
  primary_molecule: string;
  has_hologram_requirement: boolean;
}

export interface ProductSummary {
  slug: string;
  reg_no: string;
  product_name: string;
  category: CategoryInfo;
  holder: string;
  manufacturer: string;
  dosage: string;
  status: string;
}

export interface GenericHub {
  slug: string;
  name: string;
  total_products: number;
  prescription_count: number;
  otc_count: number;
  supplement_count: number;
  traditional_count: number;
  veterinary_count: number;
  products: ProductSummary[];
}

export interface GenericSummary {
  slug: string;
  name: string;
  total_products: number;
  prescription_count: number;
  otc_count: number;
  supplement_count: number;
  traditional_count: number;
}

export interface CategoryDetail {
  code: CategoryCode;
  slug: CategorySlug;
  name: string;
  short: string;
  badge_color: string;
  count: number;
  definition: string;
  mal_prefix: string;
}

export interface DatabaseStats {
  total_products: number;
  approved_count: number;
  conditional_count: number;
  category_counts: Record<string, number>;
  total_generics: number;
  last_sync: string;
  source: string;
  source_url: string;
  license: string;
}

// [slug, reg_no, product_name, category_code, generic_name, holder]
export type SearchIndexItem = [string, string, string, string, string, string];
