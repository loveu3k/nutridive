#!/usr/bin/env python3
"""
NutriDive (nutridive.net) - NPRA / KKM Dataset Ingestion Pipeline
Downloads, validates, normalizes and generates static index structures
for 28,000+ Malaysian pharmaceutical & supplement products.
Data Source: National Pharmaceutical Regulatory Agency (NPRA) via data.gov.my
License: Creative Commons Attribution 4.0 International (CC BY 4.0)
"""

import os
import io
import re
import json
import urllib.request
import datetime
from collections import defaultdict
import pandas as pd

PARQUET_URL = "https://storage.data.gov.my/healthcare/pharmaceutical_products.parquet"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_PARQUET_PATH = os.path.join(BASE_DIR, "scripts", "pharmaceutical_products.parquet")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
PRODUCTS_DIR = os.path.join(PROCESSED_DIR, "products")
GENERIC_MAP_DIR = os.path.join(PROCESSED_DIR, "generic_map")

def slugify(s):
    if not s:
        return ""
    s = str(s).strip().lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

def clean_text(s):
    if pd.isna(s) or s is None:
        return ""
    return re.sub(r'\s+', ' ', str(s)).strip()

def parse_active_ingredients(raw):
    """
    Parses active ingredients from NPRA format:
    e.g. "ATENOLOL[100MG]" or "SPICA PRUNELLA VULGARIS[90;mg;450;mg],Radix Salviae Miltiorrhiza[80.1;mg;450;mg]"
    """
    if pd.isna(raw) or not raw:
        return []
    raw_str = str(raw).strip()
    if not raw_str:
        return []
    
    results = []
    # Match: Name[Dosage] or just Name
    matches = re.findall(r'([^,\[]+)(?:\[(.*?)\])?', raw_str)
    for name, dose in matches:
        clean_name = clean_text(name)
        clean_dose = ""
        if dose:
            parts = [p.strip() for p in re.split(r'[,;]', dose) if p.strip()]
            if parts:
                if len(parts) == 1:
                    m = re.match(r'^([\d.]+\s*(?:mg|g|mcg|ug|iu|%))\s+0$', parts[0], re.I)
                    clean_dose = m.group(1) if m else parts[0]
                else:
                    first, second = parts[0], parts[1]
                    if re.match(r'^[\d.]+\s*ml$', second, re.I):
                        clean_dose = f"{first} / {second}"
                    else:
                        clean_dose = first
        if clean_name:
            results.append({
                "name": clean_name,
                "dosage": clean_dose
            })
    return results

def extract_primary_molecule(generic_name, ingredients):
    """
    Derives the clean generic molecule name for cross-referencing.
    e.g. 'Atenolol 100 mg Tablet' -> 'Atenolol'
    """
    if generic_name and pd.notna(generic_name):
        txt = str(generic_name).strip()
        # Strip dosage, unit, dosage form (e.g. 100 mg Tablet, 500mg Capsule, 10 mg/ml Injection)
        m = re.split(r'\d+\s*(?:mg|g|mcg|ug|ml|%|iu|dose)', txt, flags=re.IGNORECASE)
        candidate = clean_text(m[0])
        if len(candidate) > 2 and not candidate.isdigit():
            # Clean up trailing words like 'With', 'And', etc.
            return candidate.title()
    
    # Fallback to first active ingredient
    if ingredients:
        primary = ingredients[0]["name"]
        # Remove parenthetical comments e.g. (Rubra), (Peppermint)
        primary = re.sub(r'\s*\([^)]*\)', '', primary)
        primary = clean_text(primary)
        if len(primary) > 2:
            return primary.title()
            
    return "General Formulation"

def classify_category(reg_no, desc):
    """
    Categorizes the product into NPRA classifications:
    - A: Prescription (Ethical Medicine)
    - X: Over-The-Counter (OTC)
    - N: Dietary & Health Supplement
    - T: Traditional & Herbal Medicine
    - V: Veterinary
    - H: Homeopathy
    """
    reg = str(reg_no).strip().upper()
    desc_str = str(desc).strip().upper() if pd.notna(desc) else ""
    
    # Extract suffix letter from MAL number (e.g. MAL19900523AZ -> A, MAL06061503TC -> T)
    m = re.search(r'MAL\d+([A-Z])', reg)
    suffix_letter = m.group(1) if m else ""
    
    if suffix_letter == "A" or "PRESCRIPTION" in desc_str or "CHEMICAL ENTITY" in desc_str or "BIOLOGIC" in desc_str:
        return {
            "code": "A",
            "slug": "prescription",
            "name": "Prescription Medicine",
            "short": "Prescription",
            "description": "Ethical medicine requiring a certified doctor's prescription under Malaysian Poison Act 1952."
        }
    elif suffix_letter == "X" or "NON PRESCRIPTION" in desc_str or "OTC" in desc_str:
        return {
            "code": "X",
            "slug": "otc",
            "name": "Over-the-Counter (OTC)",
            "short": "OTC",
            "description": "Medicines available for direct public purchase without a prescription."
        }
    elif suffix_letter == "N" or "HEALTH SUPPLEMENT" in desc_str:
        return {
            "code": "N",
            "slug": "supplement",
            "name": "Health Supplement",
            "short": "Supplement",
            "description": "Dietary supplements, vitamins, and minerals regulated under NPRA safety and quality guidelines."
        }
    elif suffix_letter == "T" or "NATURAL" in desc_str or "TRADITIONAL" in desc_str:
        return {
            "code": "T",
            "slug": "traditional",
            "name": "Traditional & Herbal",
            "short": "Traditional",
            "description": "Traditional medicines, herbal preparations, and natural health products."
        }
    elif suffix_letter == "V" or "VETERINARY" in desc_str:
        return {
            "code": "V",
            "slug": "veterinary",
            "name": "Veterinary Medicine",
            "short": "Veterinary",
            "description": "Pharmaceuticals registered exclusively for animal healthcare."
        }
    elif suffix_letter == "H":
        return {
            "code": "H",
            "slug": "homeopathic",
            "name": "Homeopathic Medicine",
            "short": "Homeopathy",
            "description": "Homeopathic preparations registered with the NPRA."
        }
    
    return {
        "code": "O",
        "slug": "general",
        "name": "General Pharmaceutical",
        "short": "General",
        "description": "Regulated pharmaceutical formulation."
    }

def format_date(d):
    if pd.isna(d) or d is None:
        return None
    if isinstance(d, (datetime.date, datetime.datetime)):
        return d.strftime("%Y-%m-%d")
    s = str(d).strip()
    if s and s != "NaT" and s != "nan":
        return s[:10]
    return None

def download_dataset():
    if os.path.exists(RAW_PARQUET_PATH):
        print(f"[1/5] Using cached dataset at {RAW_PARQUET_PATH}")
        return
    print(f"[1/5] Downloading official NPRA dataset from {PARQUET_URL}...")
    os.makedirs(os.path.dirname(RAW_PARQUET_PATH), exist_ok=True)
    req = urllib.request.Request(PARQUET_URL, headers={"User-Agent": "NutriDive-Ingest/1.0"})
    with urllib.request.urlopen(req) as resp, open(RAW_PARQUET_PATH, "wb") as f:
        f.write(resp.read())
    print(f"Downloaded successfully: {os.path.getsize(RAW_PARQUET_PATH):,} bytes")

def run():
    download_dataset()
    
    print("[2/5] Reading and validating parquet data...")
    df = pd.read_parquet(RAW_PARQUET_PATH)
    total_rows = len(df)
    print(f"Loaded {total_rows:,} records from NPRA dataset.")
    
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    os.makedirs(PRODUCTS_DIR, exist_ok=True)
    os.makedirs(GENERIC_MAP_DIR, exist_ok=True)
    
    # Tracking maps
    products_by_slug = {}
    generic_to_products = defaultdict(list)
    category_counts = defaultdict(int)
    status_counts = defaultdict(int)
    search_index = []
    
    print("[3/5] Processing, normalizing, and extracting entities...")
    for idx, row in df.iterrows():
        reg_no = clean_text(row.get("reg_no"))
        if not reg_no:
            continue
            
        slug = reg_no.lower()
        product_name = clean_text(row.get("product"))
        status = clean_text(row.get("status"))
        desc = clean_text(row.get("description"))
        holder = clean_text(row.get("holder"))
        manufacturer = clean_text(row.get("manufacturer"))
        importer = clean_text(row.get("importer"))
        date_reg = format_date(row.get("date_reg"))
        date_end = format_date(row.get("date_end"))
        raw_generic = clean_text(row.get("generic_name"))
        
        # Parse ingredients
        ingredients = parse_active_ingredients(row.get("active_ingredient"))
        
        # Primary molecule for cross-referencing
        primary_molecule = extract_primary_molecule(raw_generic, ingredients)
        primary_slug = slugify(primary_molecule)
        if not primary_slug:
            primary_slug = "general-formulation"
            primary_molecule = "General Formulation"
            
        # Category classification
        cat = classify_category(reg_no, desc)
        category_counts[cat["slug"]] += 1
        status_counts[status] += 1
        
        # Build structured product item
        product_data = {
            "slug": slug,
            "reg_no": reg_no,
            "product_name": product_name,
            "status": status,
            "category": cat,
            "holder": holder,
            "manufacturer": manufacturer,
            "importer": importer if importer else None,
            "date_reg": date_reg,
            "date_end": date_end,
            "active_ingredients": ingredients,
            "generic_name": raw_generic if raw_generic else primary_molecule,
            "generic_slug": primary_slug,
            "primary_molecule": primary_molecule,
            "has_hologram_requirement": cat["code"] in ["A", "X", "N", "T"],
        }
        
        products_by_slug[slug] = product_data
        
        # Add to generic cross-reference map
        generic_to_products[primary_slug].append({
            "slug": slug,
            "reg_no": reg_no,
            "product_name": product_name,
            "category": cat,
            "holder": holder,
            "manufacturer": manufacturer,
            "dosage": ingredients[0]["dosage"] if ingredients else "",
            "status": status,
        })
        
        # Add to search index (optimized array for zero overhead)
        # [slug, reg_no, product_name, category_code, generic_name, holder]
        search_index.append([
            slug,
            reg_no,
            product_name,
            cat["code"],
            primary_molecule,
            holder
        ])
    
    print(f"[4/5] Writing {len(products_by_slug):,} partitioned product records...")
    # Write partitioned product JSON files: products/{prefix}/{slug}.json
    prefix_dirs = set()
    for slug, pdata in products_by_slug.items():
        prefix = slug[:5] # e.g. "mal19", "mal06", "mal20"
        prefix_dir = os.path.join(PRODUCTS_DIR, prefix)
        if prefix not in prefix_dirs:
            os.makedirs(prefix_dir, exist_ok=True)
            prefix_dirs.add(prefix)
            
        file_path = os.path.join(prefix_dir, f"{slug}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(pdata, f, separators=(",", ":"), ensure_ascii=False)
            
    print(f"[4/5] Writing {len(generic_to_products):,} generic cross-reference profiles...")
    generics_summary = []
    for gslug, prods in generic_to_products.items():
        if not prods:
            continue
        primary_name = prods[0]["product_name"]
        for p in prods:
            # find original primary molecule name
            full_p = products_by_slug.get(p["slug"])
            if full_p and full_p.get("primary_molecule"):
                primary_name = full_p["primary_molecule"]
                break
                
        # Category breakdown for this molecule
        mol_cats = defaultdict(int)
        for p in prods:
            mol_cats[p["category"]["slug"]] += 1
            
        generic_doc = {
            "slug": gslug,
            "name": primary_name,
            "total_products": len(prods),
            "prescription_count": mol_cats["prescription"],
            "otc_count": mol_cats["otc"],
            "supplement_count": mol_cats["supplement"],
            "traditional_count": mol_cats["traditional"],
            "veterinary_count": mol_cats["veterinary"],
            "products": prods,
        }
        
        map_path = os.path.join(GENERIC_MAP_DIR, f"{gslug}.json")
        with open(map_path, "w", encoding="utf-8") as f:
            json.dump(generic_doc, f, separators=(",", ":"), ensure_ascii=False)
            
        generics_summary.append({
            "slug": gslug,
            "name": primary_name,
            "total_products": len(prods),
            "prescription_count": mol_cats["prescription"],
            "otc_count": mol_cats["otc"],
            "supplement_count": mol_cats["supplement"],
            "traditional_count": mol_cats["traditional"],
        })
        
    # Sort generics by total product count descending
    generics_summary.sort(key=lambda x: x["total_products"], reverse=True)
    with open(os.path.join(PROCESSED_DIR, "generics.json"), "w", encoding="utf-8") as f:
        json.dump(generics_summary, f, separators=(",", ":"), ensure_ascii=False)
        
    # Write search index
    print(f"[5/5] Writing search index and category summaries...")
    with open(os.path.join(PROCESSED_DIR, "search_index.json"), "w", encoding="utf-8") as f:
        json.dump(search_index, f, separators=(",", ":"), ensure_ascii=False)
        
    # Categories metadata
    categories_doc = {
        "prescription": {
            "code": "A",
            "slug": "prescription",
            "name": "Prescription Medicine",
            "short": "Prescription",
            "badge_color": "blue",
            "count": category_counts["prescription"],
            "definition": "Scheduled medicines requiring a valid doctor's prescription in Malaysia under the Poison Act 1952.",
            "mal_prefix": "MAL...A"
        },
        "otc": {
            "code": "X",
            "slug": "otc",
            "name": "Over-the-Counter (OTC)",
            "short": "OTC",
            "badge_color": "emerald",
            "count": category_counts["otc"],
            "definition": "Non-prescription medications available directly from community pharmacies for self-limiting symptoms.",
            "mal_prefix": "MAL...X"
        },
        "supplement": {
            "code": "N",
            "slug": "supplement",
            "name": "Health Supplement",
            "short": "Supplement",
            "badge_color": "purple",
            "count": category_counts["supplement"],
            "definition": "Vitamins, minerals, amino acids, and dietary supplements evaluated and registered by NPRA for safety.",
            "mal_prefix": "MAL...N"
        },
        "traditional": {
            "code": "T",
            "slug": "traditional",
            "name": "Traditional & Natural Product",
            "short": "Traditional",
            "badge_color": "amber",
            "count": category_counts["traditional"],
            "definition": "Herbal remedies, Traditional Chinese Medicine (TCM), Ayurvedic, and Jamu preparations registered with NPRA.",
            "mal_prefix": "MAL...T"
        },
        "veterinary": {
            "code": "V",
            "slug": "veterinary",
            "name": "Veterinary Medicine",
            "short": "Veterinary",
            "count": category_counts["veterinary"],
            "definition": "Pharmaceutical products formulated exclusively for veterinary healthcare.",
            "mal_prefix": "MAL...V"
        }
    }
    with open(os.path.join(PROCESSED_DIR, "categories.json"), "w", encoding="utf-8") as f:
        json.dump(categories_doc, f, indent=2, ensure_ascii=False)
        
    # Global database statistics
    stats_doc = {
        "total_products": len(products_by_slug),
        "approved_count": status_counts.get("PRODUCT APPROVED", 0),
        "conditional_count": status_counts.get("CONDITIONAL REGISTRATION", 0),
        "category_counts": dict(category_counts),
        "total_generics": len(generic_to_products),
        "last_sync": datetime.date.today().isoformat(),
        "source": "National Pharmaceutical Regulatory Agency (NPRA), Ministry of Health Malaysia (KKM)",
        "source_url": "https://data.gov.my/data-catalogue/pharmaceutical_products",
        "license": "Creative Commons Attribution 4.0 International (CC BY 4.0)"
    }
    with open(os.path.join(PROCESSED_DIR, "stats.json"), "w", encoding="utf-8") as f:
        json.dump(stats_doc, f, indent=2, ensure_ascii=False)
        
    print(f"\n[DONE] Ingestion pipeline complete!")
    print(f"- Total products indexed: {len(products_by_slug):,}")
    print(f"- Approved: {status_counts.get('PRODUCT APPROVED', 0):,}")
    print(f"- Conditional: {status_counts.get('CONDITIONAL REGISTRATION', 0):,}")
    print(f"- Unique generic cross-reference hubs: {len(generic_to_products):,}")
    print(f"- Search index items: {len(search_index):,}")

if __name__ == "__main__":
    run()
