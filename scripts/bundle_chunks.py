#!/usr/bin/env python3
"""
Bundle products and generics from raw parquet into compact chunk files.
Reduces 33,246 loose files to ~60 structured chunk files.
"""

import os
import re
import json
import time
import datetime
from collections import defaultdict
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OFFICIAL_FILE = os.path.join(BASE_DIR, "data", "official_downloads", "pharmaceutical_products.parquet")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
PRODUCT_CHUNKS_DIR = os.path.join(PROCESSED_DIR, "product_chunks")
GENERIC_CHUNKS_DIR = os.path.join(PROCESSED_DIR, "generic_chunks")
CATEGORY_ITEMS_DIR = os.path.join(PROCESSED_DIR, "category_items")

def slugify(s):
    if not s:
        return ""
    s = str(s).strip().lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

def clean_text(s):
    if pd.isna(s) or s is None:
        return ""
    txt = str(s).strip()
    txt = re.sub(r'<[^>]+>', '', txt)
    txt = txt.replace('&amp;', '&').replace('&trade;', '').replace('&reg;', '')
    return re.sub(r'\s+', ' ', txt).strip()

def format_date(d):
    if pd.isna(d) or d is None:
        return None
    if isinstance(d, (datetime.date, datetime.datetime)):
        return d.strftime("%Y-%m-%d")
    s = str(d).strip()
    if s and s != "NaT" and s != "nan":
        return s[:10]
    return None

def extract_strength_from_name(name, generic_name=None):
    texts = [name or '', generic_name or '']
    for text in texts:
        if not text:
            continue
        # Pattern 1: X/Y mcg/dose or mg/dose
        m = re.search(r'(\d+(?:\.\d+)?\s*/\s*\d+(?:\.\d+)?\s*(?:mcg|ug|mg|iu)\s*/\s*dose)', text, re.I)
        if m:
            return re.sub(r'\s+', ' ', m.group(1).strip())
            
        # Pattern 2: X mg/Y ml or X% w/v or X% w/w
        m = re.search(r'(\d+(?:\.\d+)?\s*(?:mg|g|mcg|ug|iu)\s*/\s*\d+(?:\.\d+)?\s*ml)', text, re.I)
        if m:
            return re.sub(r'\s+', ' ', m.group(1).strip())

        # Pattern 3: percentage like 0.05% or 2% or 10%
        m = re.search(r'(\d+(?:\.\d+)?\s*%)', text)
        if m:
            return m.group(1).strip()
            
        # Pattern 4: standard dose like 500mg, 500 mg, 100 mcg, 200 IU, 1 g
        m = re.search(r'(\b\d+(?:\.\d+)?\s*(?:mg|mcg|ug|iu|gm|g)\b)', text, re.I)
        if m:
            return m.group(1).strip()
            
    return ''

def clean_dosage_value(dose_str):
    if not dose_str:
        return ''
    dose = dose_str.strip()
    if not dose or dose == '-' or dose == '- -' or dose == '0' or dose.upper() == 'REFER FILE':
        return ''
        
    parts = [p.strip() for p in re.split(r'[,;:]', dose) if p.strip()]
    if not parts:
        return ''
        
    # If parts like ['440', 'mg', '0'] or ['1.095', 'mg'] or ['949', 'mg', '1165.32', 'mg']
    if len(parts) >= 2 and re.match(r'^[\d.]+$', parts[0]) and re.match(r'^(?:mg|g|gm|mcg|ug|ml|%|iu|dose|units?)$', parts[1], re.I):
        if len(parts) >= 4 and re.match(r'^[\d.]+$', parts[2]) and re.match(r'^(?:ml|l|g|gm|dose)$', parts[3], re.I):
            return f'{parts[0]} {parts[1]} / {parts[2]} {parts[3]}'
        return f'{parts[0]} {parts[1]}'

    first = parts[0]
    # Check volume concentration '5 mg 1 ml'
    vol = re.match(r'^([\d.]+\s*(?:mg|g|gm|mcg|ug|iu|%))\s+([\d.]+\s*ml)$', first, re.I)
    if vol:
        return f'{vol.group(1)} / {vol.group(2)}'

    # Strip trailing zero weight '100mg 0'
    m_zero = re.match(r'^([\d.]+\s*(?:mg|g|gm|mcg|ug|iu|%))\s+0$', first, re.I)
    if m_zero:
        return m_zero.group(1)

    # Strip gross tablet weight '500 mg 1500 mg'
    m_dual = re.match(r'^([\d.]+\s*(?:mg|g|gm|mcg|ug|iu|%))\s+[\d.]+\s*(?:mg|g|gm)$', first, re.I)
    if m_dual:
        return m_dual.group(1)

    if len(parts) > 1:
        second = parts[1]
        if re.match(r'^[\d.]+\s*ml$', second, re.I):
            return f'{first} / {second}'
        m_sec_dual = re.match(r'^[\d.]+\s*(?:mg|g|gm)$', second, re.I)
        if m_sec_dual:
            return first
            
    if re.match(r'^[\d.]+$', first):
        return f'{first} mg'

    return first

def parse_active_ingredients(raw, prod_name=None, generic_name=None, category_code=None):
    if not raw or pd.isna(raw):
        if prod_name:
            st = extract_strength_from_name(prod_name, generic_name)
            if st:
                mol = generic_name or prod_name
                return [{'name': mol, 'dosage': st}]
        return []
        
    raw_str = str(raw).strip()
    if not raw_str:
        return []
        
    # Split by brackets
    items = []
    pos = 0
    while True:
        b_open = raw_str.find('[', pos)
        if b_open == -1:
            break
        b_close = raw_str.find(']', b_open)
        if b_close == -1:
            break
        name_part = raw_str[pos:b_open].strip().lstrip(',').strip()
        dose_part = raw_str[b_open+1:b_close].strip()
        items.append((name_part, dose_part))
        pos = b_close + 1
        
    results = []
    for name, dose in items:
        name = clean_text(name)
        clean_dose = clean_dosage_value(dose)
        if not clean_dose:
            st = extract_strength_from_name(name)
            if st:
                clean_dose = st
        if name or clean_dose:
            results.append({'name': name, 'dosage': clean_dose})
        
    all_empty = all(not r['dosage'] for r in results)
    if all_empty:
        fallback_st = extract_strength_from_name(prod_name, generic_name)
        if fallback_st and results:
            results[0]['dosage'] = fallback_st
        elif category_code == 'T':
            for r in results:
                if not r['dosage']:
                    r['dosage'] = 'Herbal Formulation'
                    
    return results

def extract_primary_molecule(generic_name, ingredients):
    if generic_name and pd.notna(generic_name):
        txt = str(generic_name).strip()
        m = re.split(r'\d+(?:\.\d+)?\s*(?:mg|g|mcg|ug|ml|%|iu|dose)', txt, flags=re.IGNORECASE)
        candidate = re.sub(r'[\d.,\s]+$', '', clean_text(m[0]))
        if len(candidate) > 2 and not candidate.isdigit():
            return candidate.title()
    if ingredients:
        primary = ingredients[0]["name"]
        primary = re.sub(r'\s*\([^)]*\)', '', primary)
        primary = re.sub(r'[\d.,\s]+$', '', clean_text(primary))
        if len(primary) > 2:
            return primary.title()
    return "General Formulation"

def classify_category(reg_no, desc):
    reg = str(reg_no).strip().upper()
    desc_str = str(desc).strip().upper() if pd.notna(desc) else ""
    m = re.search(r'MAL\d+([A-Z])', reg)
    suffix_letter = m.group(1) if m else ""
    if suffix_letter == "A" or "PRESCRIPTION" in desc_str or "CHEMICAL ENTITY" in desc_str or "BIOLOGIC" in desc_str:
        return {"code": "A", "slug": "prescription", "name": "Prescription Medicine", "short": "Prescription"}
    elif suffix_letter == "X" or "NON PRESCRIPTION" in desc_str or "OTC" in desc_str:
        return {"code": "X", "slug": "otc", "name": "Over-the-Counter (OTC)", "short": "OTC"}
    elif suffix_letter == "N" or "HEALTH SUPPLEMENT" in desc_str:
        return {"code": "N", "slug": "supplement", "name": "Health Supplement", "short": "Supplement"}
    elif suffix_letter == "T" or "NATURAL" in desc_str or "TRADITIONAL" in desc_str:
        return {"code": "T", "slug": "traditional", "name": "Traditional & Herbal", "short": "Traditional"}
    elif suffix_letter == "V" or "VETERINARY" in desc_str:
        return {"code": "V", "slug": "veterinary", "name": "Veterinary Medicine", "short": "Veterinary"}
    return {"code": "O", "slug": "general", "name": "General Pharmaceutical", "short": "General"}

def run_bundle():
    t0 = time.time()
    print("[1/5] Loading official parquet dataset...")
    df = pd.read_parquet(OFFICIAL_FILE)
    print(f"Loaded {len(df):,} records.")

    os.makedirs(PRODUCT_CHUNKS_DIR, exist_ok=True)
    os.makedirs(GENERIC_CHUNKS_DIR, exist_ok=True)
    os.makedirs(CATEGORY_ITEMS_DIR, exist_ok=True)

    products_by_prefix = defaultdict(dict)
    generic_to_products = defaultdict(list)
    category_counts = defaultdict(int)
    category_items = defaultdict(list)
    status_counts = defaultdict(int)
    search_index = []

    print("[2/5] Normalizing entities...")
    for _, row in df.iterrows():
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

        cat = classify_category(reg_no, desc)
        category_counts[cat["slug"]] += 1
        status_counts[status] += 1

        ingredients = parse_active_ingredients(row.get("active_ingredient"), product_name, raw_generic, cat["code"])
        primary_molecule = extract_primary_molecule(raw_generic, ingredients)
        primary_slug = slugify(primary_molecule)
        if not primary_slug:
            primary_slug = "general-formulation"
            primary_molecule = "General Formulation"

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

        prefix = slug[:5]
        products_by_prefix[prefix][slug] = product_data

        hub_dose = ""
        if raw_generic:
            hub_dose = extract_strength_from_name(raw_generic)
        if not hub_dose and ingredients:
            p_words = [w.lower() for w in re.findall(r'[a-zA-Z0-9]+', primary_molecule) if len(w) > 2]
            for ing in ingredients:
                ing_name_lower = ing["name"].lower()
                if any(w in ing_name_lower for w in p_words) and ing["dosage"]:
                    hub_dose = ing["dosage"]
                    break
            if not hub_dose:
                for ing in ingredients:
                    if ing["dosage"]:
                        hub_dose = ing["dosage"]
                        break
        if not hub_dose:
            hub_dose = extract_strength_from_name(product_name)
        if not hub_dose and cat["code"] == "T":
            hub_dose = "Herbal Formulation"

        generic_to_products[primary_slug].append({
            "slug": slug,
            "reg_no": reg_no,
            "product_name": product_name,
            "category": cat,
            "holder": holder,
            "manufacturer": manufacturer,
            "dosage": hub_dose,
            "status": status,
        })

        index_item = [slug, reg_no, product_name, cat["code"], primary_molecule, holder]
        search_index.append(index_item)
        category_items[cat["slug"]].append(index_item)

    print(f"[3/5] Writing {len(products_by_prefix)} product chunk files...")
    total_product_bytes = 0
    for prefix, pdict in products_by_prefix.items():
        chunk_file = os.path.join(PRODUCT_CHUNKS_DIR, f"{prefix}.json")
        with open(chunk_file, "w", encoding="utf-8") as f:
            json.dump(pdict, f, separators=(",", ":"), ensure_ascii=False)
        total_product_bytes += os.path.getsize(chunk_file)
    print(f"Product chunks: {len(products_by_prefix)} files ({total_product_bytes / 1024 / 1024:.2f} MB)")

    print("[4/5] Organizing and writing generic molecule chunk files...")
    generics_by_letter = defaultdict(dict)
    generics_summary = []
    for gslug, prods in generic_to_products.items():
        if not prods:
            continue
        primary_name = prods[0]["product_name"]
        for p in prods:
            p_prefix = p["slug"][:5]
            full_p = products_by_prefix.get(p_prefix, {}).get(p["slug"])
            if full_p and full_p.get("primary_molecule"):
                primary_name = full_p["primary_molecule"]
                break

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

        first_char = gslug[0] if gslug else 'a'
        key = first_char if first_char.isalpha() else 'other'
        generics_by_letter[key][gslug] = generic_doc

        generics_summary.append({
            "slug": gslug,
            "name": primary_name,
            "total_products": len(prods),
            "prescription_count": mol_cats["prescription"],
            "otc_count": mol_cats["otc"],
            "supplement_count": mol_cats["supplement"],
            "traditional_count": mol_cats["traditional"],
        })

    total_generic_bytes = 0
    for letter, gdict in generics_by_letter.items():
        chunk_file = os.path.join(GENERIC_CHUNKS_DIR, f"{letter}.json")
        with open(chunk_file, "w", encoding="utf-8") as f:
            json.dump(gdict, f, separators=(",", ":"), ensure_ascii=False)
        total_generic_bytes += os.path.getsize(chunk_file)
    print(f"Generic chunks: {len(generics_by_letter)} files ({total_generic_bytes / 1024 / 1024:.2f} MB)")

    print("[5/5] Writing summaries, categories and search index...")
    generics_summary.sort(key=lambda x: x["total_products"], reverse=True)
    with open(os.path.join(PROCESSED_DIR, "generics.json"), "w", encoding="utf-8") as f:
        json.dump(generics_summary, f, separators=(",", ":"), ensure_ascii=False)
    with open(os.path.join(PROCESSED_DIR, "generics_top50.json"), "w", encoding="utf-8") as f:
        json.dump(generics_summary[:50], f, separators=(",", ":"), ensure_ascii=False)

    for cat_slug, items in category_items.items():
        cat_file = os.path.join(CATEGORY_ITEMS_DIR, f"{cat_slug}.json")
        with open(cat_file, "w", encoding="utf-8") as f:
            json.dump(items, f, separators=(",", ":"), ensure_ascii=False)

    with open(os.path.join(PROCESSED_DIR, "search_index.json"), "w", encoding="utf-8") as f:
        json.dump(search_index, f, separators=(",", ":"), ensure_ascii=False)

    stats_doc = {
        "total_products": sum(len(p) for p in products_by_prefix.values()),
        "approved_count": status_counts.get("PRODUCT APPROVED", 0),
        "conditional_count": status_counts.get("CONDITIONAL REGISTRATION", 0),
        "category_counts": dict(category_counts),
        "total_generics": len(generic_to_products),
        "last_sync": datetime.date.today().isoformat(),
        "source": "National Pharmaceutical Regulatory Agency (NPRA), Ministry of Health Malaysia (KKM)",
        "source_url": "https://storage.data.gov.my/healthcare/pharmaceutical_products.parquet",
        "license": "Creative Commons Attribution 4.0 International (CC BY 4.0)"
    }
    with open(os.path.join(PROCESSED_DIR, "stats.json"), "w", encoding="utf-8") as f:
        json.dump(stats_doc, f, indent=2, ensure_ascii=False)

    print(f"\n[DONE] Successfully bundled into compact chunks in {time.time() - t0:.2f} seconds!")
    print(f"Total product chunk files: {len(products_by_prefix)}")
    print(f"Total generic chunk files: {len(generics_by_letter)}")
    print(f"Total category files     : {len(category_items)}")

if __name__ == "__main__":
    run_bundle()
