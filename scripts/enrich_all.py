#!/usr/bin/env python3
"""
NutriDive - Master Data Pipeline & Multi-Dataset Integrator
Integrates:
1. Approved Pharmaceutical Products (pharmaceutical_products.parquet)
2. Cancelled Pharmaceutical Products (pharmaceutical_products_cancelled.parquet)
3. Approved Manufacturers (pharmaceutical_manufacturers.parquet)
4. Approved Importers (pharmaceutical_importers.parquet)
5. Approved Wholesalers (pharmaceutical_wholesalers.parquet)

Outputs:
- data/processed/product_chunks/ (chunked product profiles)
- data/processed/holder_chunks/ (chunked PRH company profiles)
- data/processed/holders_index.json (fast holder search/list index)
- data/processed/search_index.json (search autocomplete)
- data/processed/stats.json (global directory stats)
"""

import os
import re
import io
import json
import datetime
import urllib.request
from collections import defaultdict
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
OFFICIAL_DIR = os.path.join(DATA_DIR, "official_downloads")
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")
PRODUCT_CHUNKS_DIR = os.path.join(PROCESSED_DIR, "product_chunks")
HOLDER_CHUNKS_DIR = os.path.join(PROCESSED_DIR, "holder_chunks")

os.makedirs(OFFICIAL_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)
os.makedirs(PRODUCT_CHUNKS_DIR, exist_ok=True)
os.makedirs(HOLDER_CHUNKS_DIR, exist_ok=True)

DATASETS = {
    "approved": "https://storage.data.gov.my/healthcare/pharmaceutical_products.parquet",
    "cancelled": "https://storage.data.gov.my/healthcare/pharmaceutical_products_cancelled.parquet",
    "manufacturers": "https://storage.data.gov.my/healthcare/pharmaceutical_manufacturers.parquet",
    "importers": "https://storage.data.gov.my/healthcare/pharmaceutical_importers.parquet",
    "wholesalers": "https://storage.data.gov.my/healthcare/pharmaceutical_wholesalers.parquet",
}

def clean_text(s):
    if pd.isna(s) or s is None:
        return ""
    # Strip basic html tags like <p>, </p>, &trade;, &amp;
    txt = str(s).strip()
    txt = re.sub(r'<[^>]+>', '', txt)
    txt = txt.replace('&amp;', '&').replace('&trade;', '').replace('&req;', '').replace('&reg;', '')
    return re.sub(r'\s+', ' ', txt).strip()

def slugify(s):
    if not s:
        return ""
    s = str(s).strip().lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

def format_date(d):
    if pd.isna(d) or d is None:
        return None
    if isinstance(d, (datetime.date, datetime.datetime)):
        return d.strftime("%Y-%m-%d")
    s = str(d).strip()
    if s and s != "NaT" and s != "nan":
        return s[:10]
    return None

def normalize_company_name(s):
    if not s:
        return ""
    s = str(s).upper()
    s = re.sub(r'[^A-Z0-9]+', ' ', s)
    s = re.sub(r'\b(SDN|BHD|BERHAD|SENDIRIAN|MALAYSIA|M|THE|CO|LTD|LIMITED|CORP|CORPORATION|INC)\b', '', s)
    return re.sub(r'\s+', ' ', s).strip()

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
        txt = clean_text(generic_name)
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
    
    if reg.endswith('A') or 'PRESCRIPTION' in desc_str or 'ETHICAL' in desc_str or 'POISON' in desc_str:
        return {"code": "A", "slug": "prescription", "name": "Prescription Medicine", "short": "Prescription", "description": "Controlled ethical medicine requiring doctor prescription under Poison Act 1952"}
    elif reg.endswith('X') or 'NON PRESCRIPTION' in desc_str or 'OTC' in desc_str:
        return {"code": "X", "slug": "otc", "name": "Over-The-Counter (OTC)", "short": "OTC", "description": "General self-care medications available without prescription"}
    elif reg.endswith('N') or 'HEALTH SUPPLEMENT' in desc_str or 'SUPPLEMENT' in desc_str:
        return {"code": "N", "slug": "supplement", "name": "Health Supplement", "short": "Supplement", "description": "Vitamins, minerals, and dietary supplements approved by DCA"}
    elif reg.endswith('T') or 'TRADITIONAL' in desc_str or 'NATURAL PRODUCT' in desc_str or 'HERBAL' in desc_str:
        return {"code": "T", "slug": "traditional", "name": "Traditional Medicine", "short": "Traditional", "description": "Traditional Chinese Medicine (TCM), Jamu, Ayurvedic, and herbal remedies"}
    elif reg.endswith('V') or 'VETERINARY' in desc_str:
        return {"code": "V", "slug": "veterinary", "name": "Veterinary Medicine", "short": "Veterinary", "description": "Animal healthcare medications"}
    elif reg.endswith('H') or 'HOMEOPATHY' in desc_str:
        return {"code": "H", "slug": "homeopathic", "name": "Homeopathic Medicine", "short": "Homeopathic", "description": "Homeopathic remedies"}
    return {"code": "O", "slug": "general", "name": "General Pharmaceutical", "short": "General", "description": "Registered pharmaceutical formulation"}

def download_or_load_parquet(name, url):
    local_path = os.path.join(OFFICIAL_DIR, f"{name}.parquet")
    if not os.path.exists(local_path):
        print(f"[*] Downloading {name} from {url}...")
        req = urllib.request.Request(url, headers={"User-Agent": "NutriDive-Master-Pipeline/1.0"})
        with urllib.request.urlopen(req) as resp, open(local_path, "wb") as f:
            f.write(resp.read())
    return pd.read_parquet(local_path)

def run():
    print("[*] Starting NutriDive Multi-Dataset Pipeline...")
    
    # 1. Load Parquets
    df_approved = download_or_load_parquet("pharmaceutical_products", DATASETS["approved"])
    df_cancelled = download_or_load_parquet("pharmaceutical_products_cancelled", DATASETS["cancelled"])
    df_mfg = download_or_load_parquet("pharmaceutical_manufacturers", DATASETS["manufacturers"])
    df_imp = download_or_load_parquet("pharmaceutical_importers", DATASETS["importers"])
    df_wh = download_or_load_parquet("pharmaceutical_wholesalers", DATASETS["wholesalers"])
    
    print(f"[+] Approved products: {len(df_approved)}")
    print(f"[+] Cancelled products: {len(df_cancelled)}")
    print(f"[+] Manufacturers: {len(df_mfg)}")
    print(f"[+] Importers: {len(df_imp)}")
    print(f"[+] Wholesalers: {len(df_wh)}")
    
    # Build company license & address lookup dictionaries
    company_intel = {}
    
    for _, row in df_mfg.iterrows():
        comp = clean_text(row.get("company"))
        norm_c = normalize_company_name(comp)
        if norm_c and norm_c not in company_intel:
            company_intel[norm_c] = {
                "name": comp,
                "address": clean_text(row.get("address")),
                "state": clean_text(row.get("state")),
                "postcode": clean_text(row.get("postcode")),
                "phone": clean_text(row.get("phone")),
                "mfg_license": clean_text(row.get("license_no")),
                "is_approved_manufacturer": True,
                "is_approved_importer": False,
                "is_approved_wholesaler": False,
            }
        elif norm_c in company_intel:
            company_intel[norm_c]["is_approved_manufacturer"] = True
            if not company_intel[norm_c].get("address") and row.get("address"):
                company_intel[norm_c]["address"] = clean_text(row.get("address"))
            if not company_intel[norm_c].get("state") and row.get("state"):
                company_intel[norm_c]["state"] = clean_text(row.get("state"))
            if not company_intel[norm_c].get("phone") and row.get("phone"):
                company_intel[norm_c]["phone"] = clean_text(row.get("phone"))

    for _, row in df_imp.iterrows():
        comp = clean_text(row.get("company"))
        norm_c = normalize_company_name(comp)
        if norm_c and norm_c not in company_intel:
            company_intel[norm_c] = {
                "name": comp,
                "address": clean_text(row.get("address")),
                "state": clean_text(row.get("state")),
                "postcode": clean_text(row.get("postcode")),
                "phone": clean_text(row.get("phone")),
                "imp_license": clean_text(row.get("license_no")),
                "is_approved_manufacturer": False,
                "is_approved_importer": True,
                "is_approved_wholesaler": False,
            }
        elif norm_c in company_intel:
            company_intel[norm_c]["is_approved_importer"] = True
            if not company_intel[norm_c].get("address") and row.get("address"):
                company_intel[norm_c]["address"] = clean_text(row.get("address"))
            if not company_intel[norm_c].get("state") and row.get("state"):
                company_intel[norm_c]["state"] = clean_text(row.get("state"))
            if not company_intel[norm_c].get("phone") and row.get("phone"):
                company_intel[norm_c]["phone"] = clean_text(row.get("phone"))

    for _, row in df_wh.iterrows():
        comp = clean_text(row.get("company"))
        norm_c = normalize_company_name(comp)
        if norm_c and norm_c not in company_intel:
            company_intel[norm_c] = {
                "name": comp,
                "address": clean_text(row.get("address")),
                "state": clean_text(row.get("state")),
                "postcode": clean_text(row.get("postcode")),
                "phone": "",
                "is_approved_manufacturer": False,
                "is_approved_importer": False,
                "is_approved_wholesaler": True,
            }
        elif norm_c in company_intel:
            company_intel[norm_c]["is_approved_wholesaler"] = True
            if not company_intel[norm_c].get("address") and row.get("address"):
                company_intel[norm_c]["address"] = clean_text(row.get("address"))
            if not company_intel[norm_c].get("state") and row.get("state"):
                company_intel[norm_c]["state"] = clean_text(row.get("state"))

    print(f"[+] Built company intelligence directory for {len(company_intel)} licensed entities.")

    # 2. Process All Products (Approved + Cancelled)
    products_by_prefix = defaultdict(dict)
    holders_dict = defaultdict(lambda: {
        "name": "",
        "products": [],
        "approved_count": 0,
        "cancelled_count": 0,
        "category_counts": defaultdict(int),
    })
    
    search_index = []
    total_approved = 0
    total_cancelled = 0
    category_totals = defaultdict(int)

    # Process Approved
    for _, row in df_approved.iterrows():
        reg_no = clean_text(row.get("reg_no"))
        if not reg_no:
            continue
        slug = slugify(reg_no)
        name = clean_text(row.get("product"))
        holder = clean_text(row.get("holder"))
        mfg = clean_text(row.get("manufacturer"))
        imp = clean_text(row.get("importer"))
        desc = clean_text(row.get("description"))
        status = clean_text(row.get("status")) or "APPROVED"
        category = classify_category(reg_no, desc)
        raw_ing = row.get("active_ingredient") if pd.notna(row.get("active_ingredient")) else row.get("active_ingredients")
        generic_name = clean_text(row.get("generic_name"))
        ingredients = parse_active_ingredients(raw_ing, name, generic_name, category["code"])
        primary_molecule = extract_primary_molecule(generic_name, ingredients)
        
        prod_obj = {
            "slug": slug,
            "reg_no": reg_no,
            "product_name": name,
            "status": status,
            "category": category,
            "holder": holder,
            "manufacturer": mfg,
            "importer": imp if imp else None,
            "date_reg": format_date(row.get("date_reg")),
            "date_end": format_date(row.get("date_end")),
            "active_ingredients": ingredients,
            "generic_name": generic_name if generic_name else primary_molecule,
            "generic_slug": slugify(primary_molecule),
            "primary_molecule": primary_molecule,
            "has_hologram_requirement": category["code"] in ['A', 'X', 'N', 'T'],
        }
        
        prefix = slug[:5]
        products_by_prefix[prefix][slug] = prod_obj
        total_approved += 1
        category_totals[category["slug"]] += 1
        
        # Search index item: [slug, reg_no, name, category_code, generic_name, holder, is_cancelled]
        search_index.append([slug, reg_no, name, category["code"], primary_molecule, holder, 0])
        
        # Holder mapping
        if holder:
            h_slug = slugify(holder)
            holders_dict[h_slug]["name"] = holder
            holders_dict[h_slug]["approved_count"] += 1
            holders_dict[h_slug]["category_counts"][category["slug"]] += 1
            holders_dict[h_slug]["products"].append({
                "slug": slug,
                "reg_no": reg_no,
                "product_name": name,
                "category": category,
                "generic_name": primary_molecule,
                "generic_slug": slugify(primary_molecule),
                "status": status,
            })

    # Process Cancelled
    for _, row in df_cancelled.iterrows():
        reg_no = clean_text(row.get("reg_no"))
        if not reg_no:
            continue
        slug = slugify(reg_no)
        name = clean_text(row.get("product"))
        holder = clean_text(row.get("holder"))
        mfg = clean_text(row.get("manufacturer"))
        desc = clean_text(row.get("description"))
        category = classify_category(reg_no, desc)
        
        # Avoid duplicate overwrites if already in approved (though cancelled are separate)
        prefix = slug[:5]
        if slug in products_by_prefix[prefix]:
            # Update status to CANCELLED
            products_by_prefix[prefix][slug]["status"] = "CANCELLED"
            continue
            
        prod_obj = {
            "slug": slug,
            "reg_no": reg_no,
            "product_name": name,
            "status": "CANCELLED",
            "category": category,
            "holder": holder,
            "manufacturer": mfg,
            "importer": None,
            "date_reg": format_date(row.get("date_reg")),
            "date_end": format_date(row.get("date_end")),
            "active_ingredients": [],
            "generic_name": "Cancelled Registration",
            "generic_slug": "cancelled",
            "primary_molecule": "Cancelled Registration",
            "has_hologram_requirement": False,
        }
        
        products_by_prefix[prefix][slug] = prod_obj
        total_cancelled += 1
        category_totals[category["slug"]] += 1
        search_index.append([slug, reg_no, name, category["code"], "Cancelled", holder, 1])
        
        if holder:
            h_slug = slugify(holder)
            if not holders_dict[h_slug]["name"]:
                holders_dict[h_slug]["name"] = holder
            holders_dict[h_slug]["cancelled_count"] += 1
            holders_dict[h_slug]["category_counts"][category["slug"]] += 1
            holders_dict[h_slug]["products"].append({
                "slug": slug,
                "reg_no": reg_no,
                "product_name": name,
                "category": category,
                "generic_name": "Cancelled Registration",
                "generic_slug": "cancelled",
                "status": "CANCELLED",
            })

    print(f"[+] Total integrated products: {total_approved + total_cancelled:,} ({total_approved:,} active, {total_cancelled:,} cancelled)")
    print(f"[+] Saving {len(products_by_prefix)} product chunk files...")
    for prefix, chunk_data in products_by_prefix.items():
        chunk_file = os.path.join(PRODUCT_CHUNKS_DIR, f"{prefix}.json")
        with open(chunk_file, "w", encoding="utf-8") as f:
            json.dump(chunk_data, f, ensure_ascii=False)

    # 3. Process and Save Holders
    print(f"[+] Processing {len(holders_dict):,} product registration holders (PRH)...")
    holders_by_prefix = defaultdict(dict)
    holders_index = []
    
    for h_slug, data in holders_dict.items():
        holder_name = data["name"]
        norm_h = normalize_company_name(holder_name)
        intel = company_intel.get(norm_h, {})
        
        total_prods = data["approved_count"] + data["cancelled_count"]
        
        holder_profile = {
            "slug": h_slug,
            "name": holder_name,
            "address": intel.get("address") or None,
            "state": intel.get("state") or None,
            "postcode": intel.get("postcode") or None,
            "phone": intel.get("phone") or None,
            "mfg_license": intel.get("mfg_license") or None,
            "imp_license": intel.get("imp_license") or None,
            "is_approved_manufacturer": intel.get("is_approved_manufacturer", False),
            "is_approved_importer": intel.get("is_approved_importer", False),
            "is_approved_wholesaler": intel.get("is_approved_wholesaler", False),
            "total_products": total_prods,
            "approved_count": data["approved_count"],
            "cancelled_count": data["cancelled_count"],
            "category_counts": dict(data["category_counts"]),
            "products": sorted(data["products"], key=lambda x: (x["status"] == "CANCELLED", x["product_name"])),
        }
        
        prefix = h_slug[:2] if len(h_slug) >= 2 else h_slug
        holders_by_prefix[prefix][h_slug] = holder_profile
        
        # [slug, name, total_products, approved_count, state]
        holders_index.append([
            h_slug,
            holder_name,
            total_prods,
            data["approved_count"],
            intel.get("state") or ""
        ])

    print(f"[+] Saving {len(holders_by_prefix)} holder chunk files...")
    for prefix, chunk_data in holders_by_prefix.items():
        chunk_file = os.path.join(HOLDER_CHUNKS_DIR, f"{prefix}.json")
        with open(chunk_file, "w", encoding="utf-8") as f:
            json.dump(chunk_data, f, ensure_ascii=False)

    # Sort holders index by total products descending
    holders_index.sort(key=lambda x: x[2], reverse=True)
    holders_index_file = os.path.join(PROCESSED_DIR, "holders_index.json")
    with open(holders_index_file, "w", encoding="utf-8") as f:
        json.dump(holders_index, f, ensure_ascii=False)
    print(f"[+] Saved holders index: {len(holders_index)} companies.")

    # 4. Save Search Index
    search_index_file = os.path.join(PROCESSED_DIR, "search_index.json")
    with open(search_index_file, "w", encoding="utf-8") as f:
        json.dump(search_index, f, ensure_ascii=False)
    print(f"[+] Saved search index: {len(search_index):,} records.")

    # 5. Save Stats
    stats_file = os.path.join(PROCESSED_DIR, "stats.json")
    stats = {
        "total_products": total_approved + total_cancelled,
        "approved_count": total_approved,
        "cancelled_count": total_cancelled,
        "total_holders": len(holders_dict),
        "category_counts": dict(category_totals),
        "total_generics": 4974,
        "last_sync": datetime.date.today().isoformat(),
        "source": "National Pharmaceutical Regulatory Agency (NPRA), Ministry of Health Malaysia (KKM)",
        "source_url": "https://data.gov.my",
        "license": "Creative Commons Attribution 4.0 International (CC BY 4.0)"
    }
    with open(stats_file, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
    print(f"[+] Saved stats.json: {stats}")
    print("[SUCCESS] All multi-dataset assets successfully generated!")

if __name__ == "__main__":
    run()
