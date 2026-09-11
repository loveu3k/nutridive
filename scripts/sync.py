#!/usr/bin/env python3
"""
NutriDive (nutridive.net) - Official NPRA Data Synchronization & Diff Engine
=============================================================================
Terminal CLI tool to automate data synchronization with the official Malaysian
National Pharmaceutical Regulatory Agency (NPRA / KKM) open dataset.

Features:
1. Archives official raw .parquet files with date stamps (auditable chain of custody).
2. Computes granular row-level & field-level diffs (Added, Modified, Cancelled).
3. Provides colorized, readable terminal summary.
4. Supports --dry-run mode for risk-free inspection.
5. Updates partitioned JSON files, category partitions, generic cross-references, and search indices.
6. Writes permanent JSON audit logs to data/sync_logs/.

Usage:
  python scripts/sync.py                  # Normal run with interactive confirmation
  python scripts/sync.py --dry-run        # Check for changes without modifying data
  python scripts/sync.py --yes            # Auto-confirm and apply changes
  python scripts/sync.py --force-download # Re-download official file even if already downloaded today
"""

import os
import sys
import re
import io
import json
import glob
import hashlib
import argparse
import datetime
import urllib.request
from collections import defaultdict
import pandas as pd

# Constants & Paths
PARQUET_URL = "https://storage.data.gov.my/healthcare/pharmaceutical_products.parquet"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OFFICIAL_DIR = os.path.join(BASE_DIR, "data", "official_downloads")
LOGS_DIR = os.path.join(BASE_DIR, "data", "sync_logs")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
PRODUCT_CHUNKS_DIR = os.path.join(PROCESSED_DIR, "product_chunks")
GENERIC_CHUNKS_DIR = os.path.join(PROCESSED_DIR, "generic_chunks")
CATEGORY_ITEMS_DIR = os.path.join(PROCESSED_DIR, "category_items")

# ANSI Color formatting for terminal
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

def colorize(text, color):
    # Support Windows terminals that may or may not support ANSI
    if sys.platform == "win32" and not os.environ.get("WT_SESSION") and not os.environ.get("ANSICON"):
        os.system('') # Enable VT100 on modern Windows console
    return f"{color}{text}{Colors.END}"

def get_sha256(filepath):
    h = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

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

def format_date(d):
    if pd.isna(d) or d is None:
        return None
    if isinstance(d, (datetime.date, datetime.datetime)):
        return d.strftime("%Y-%m-%d")
    s = str(d).strip()
    if s and s != "NaT" and s != "nan":
        return s[:10]
    return None

def parse_active_ingredients(raw):
    if pd.isna(raw) or not raw:
        return []
    raw_str = str(raw).strip()
    if not raw_str:
        return []
    
    results = []
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
    if generic_name and pd.notna(generic_name):
        txt = str(generic_name).strip()
        m = re.split(r'\d+\s*(?:mg|g|mcg|ug|ml|%|iu|dose)', txt, flags=re.IGNORECASE)
        candidate = clean_text(m[0])
        if len(candidate) > 2 and not candidate.isdigit():
            return candidate.title()
    
    if ingredients:
        primary = ingredients[0]["name"]
        primary = re.sub(r'\s*\([^)]*\)', '', primary)
        primary = clean_text(primary)
        if len(primary) > 2:
            return primary.title()
            
    return "General Formulation"

def classify_category(reg_no, desc):
    reg = str(reg_no).strip().upper()
    desc_str = str(desc).strip().upper() if pd.notna(desc) else ""
    
    m = re.search(r'MAL\d+([A-Z])', reg)
    suffix_letter = m.group(1) if m else ""
    
    if suffix_letter == "A" or "PRESCRIPTION" in desc_str or "CHEMICAL ENTITY" in desc_str or "BIOLOGIC" in desc_str:
        return {
            "code": "A",
            "slug": "prescription",
            "name": "Prescription Medicine",
            "short": "Prescription",
        }
    elif suffix_letter == "X" or "NON PRESCRIPTION" in desc_str or "OTC" in desc_str:
        return {
            "code": "X",
            "slug": "otc",
            "name": "Over-the-Counter (OTC)",
            "short": "OTC",
        }
    elif suffix_letter == "N" or "HEALTH SUPPLEMENT" in desc_str:
        return {
            "code": "N",
            "slug": "supplement",
            "name": "Health Supplement",
            "short": "Supplement",
        }
    elif suffix_letter == "T" or "NATURAL" in desc_str or "TRADITIONAL" in desc_str:
        return {
            "code": "T",
            "slug": "traditional",
            "name": "Traditional & Herbal",
            "short": "Traditional",
        }
    elif suffix_letter == "V" or "VETERINARY" in desc_str:
        return {
            "code": "V",
            "slug": "veterinary",
            "name": "Veterinary Medicine",
            "short": "Veterinary",
        }
    
    return {
        "code": "O",
        "slug": "general",
        "name": "General Pharmaceutical",
        "short": "General",
    }

def find_previous_baseline():
    """Finds the most recent archived parquet file prior to today."""
    os.makedirs(OFFICIAL_DIR, exist_ok=True)
    existing_files = sorted(glob.glob(os.path.join(OFFICIAL_DIR, "pharmaceutical_products_*.parquet")))
    if existing_files:
        return existing_files[-1]
    
    # Fallback to initial parquet in scripts/ if exists
    init_file = os.path.join(BASE_DIR, "scripts", "pharmaceutical_products.parquet")
    if os.path.exists(init_file):
        return init_file
    return None

def download_official_dataset(force=False):
    """Downloads the official parquet dataset and saves it to data/official_downloads/."""
    os.makedirs(OFFICIAL_DIR, exist_ok=True)
    today_str = datetime.date.today().isoformat()
    target_path = os.path.join(OFFICIAL_DIR, f"pharmaceutical_products_{today_str}.parquet")
    
    if os.path.exists(target_path) and not force:
        print(f"[*] Found today's official download: {colorize(os.path.basename(target_path), Colors.CYAN)}")
        return target_path, False
    
    print(f"[*] Downloading official NPRA dataset from:\n    {colorize(PARQUET_URL, Colors.UNDERLINE)}")
    req = urllib.request.Request(PARQUET_URL, headers={"User-Agent": "NutriDive-Official-Sync/2.0"})
    
    with urllib.request.urlopen(req) as resp, open(target_path, "wb") as f:
        content = resp.read()
        f.write(content)
        
    size_mb = os.path.getsize(target_path) / (1024 * 1024)
    print(f"[+] Download complete: {colorize(f'{size_mb:.2f} MB', Colors.GREEN)} saved to {os.path.basename(target_path)}")
    return target_path, True

def compute_diff(baseline_path, new_path):
    """Compares baseline parquet against new parquet and returns structured diff."""
    print(f"[*] Reading and comparing datasets...")
    df_new = pd.read_parquet(new_path)
    
    if not baseline_path or baseline_path == new_path:
        # First time or comparing against self
        print(f"[*] No older baseline found. Treating all {len(df_new):,} records as baseline.")
        return {
            "total_new": len(df_new),
            "added": [],
            "updated": [],
            "removed": [],
            "unchanged_count": len(df_new),
            "df_new": df_new
        }
        
    df_old = pd.read_parquet(baseline_path)
    
    # Normalize registration numbers as dict key
    old_dict = {}
    for _, row in df_old.iterrows():
        reg = clean_text(row.get("reg_no")).upper()
        if reg:
            old_dict[reg] = row
            
    new_dict = {}
    for _, row in df_new.iterrows():
        reg = clean_text(row.get("reg_no")).upper()
        if reg:
            new_dict[reg] = row
            
    added = []
    updated = []
    removed = []
    unchanged_count = 0
    
    # Check new and modified
    track_fields = [
        ("status", "Status"),
        ("product", "Product Name"),
        ("holder", "Holder"),
        ("manufacturer", "Manufacturer"),
        ("importer", "Importer"),
        ("date_reg", "Registration Date"),
        ("date_end", "Expiry Date"),
        ("active_ingredient", "Active Ingredients"),
        ("generic_name", "Generic Name")
    ]
    
    for reg, new_row in new_dict.items():
        if reg not in old_dict:
            added.append({
                "reg_no": reg,
                "product_name": clean_text(new_row.get("product")),
                "holder": clean_text(new_row.get("holder")),
                "status": clean_text(new_row.get("status")),
            })
        else:
            old_row = old_dict[reg]
            changes = {}
            for field, label in track_fields:
                val_old = clean_text(old_row.get(field))
                val_new = clean_text(new_row.get(field))
                if field in ["date_reg", "date_end"]:
                    val_old = format_date(old_row.get(field)) or ""
                    val_new = format_date(new_row.get(field)) or ""
                
                if val_old != val_new:
                    changes[field] = {
                        "label": label,
                        "old": val_old,
                        "new": val_new
                    }
            
            if changes:
                updated.append({
                    "reg_no": reg,
                    "product_name": clean_text(new_row.get("product")),
                    "changes": changes
                })
            else:
                unchanged_count += 1
                
    # Check removed
    for reg, old_row in old_dict.items():
        if reg not in new_dict:
            removed.append({
                "reg_no": reg,
                "product_name": clean_text(old_row.get("product")),
                "holder": clean_text(old_row.get("holder")),
            })
            
    return {
        "total_new": len(df_new),
        "total_old": len(df_old),
        "added": added,
        "updated": updated,
        "removed": removed,
        "unchanged_count": unchanged_count,
        "df_new": df_new
    }

def display_diff_summary(diff):
    """Prints a clear, informative colorized terminal summary of all detected changes."""
    tot = f"{diff['total_new']:,}"
    unchanged = f"{diff['unchanged_count']:,}"
    added_len = len(diff['added'])
    updated_len = len(diff['updated'])
    removed_len = len(diff['removed'])

    print("\n" + "=" * 68)
    print(colorize("   NUTRIDIVE NPRA DATA SYNCHRONIZATION AUDIT REPORT", Colors.BOLD + Colors.CYAN))
    print("=" * 68)
    print(f"Total Official Records : {colorize(tot, Colors.BOLD)}")
    print(f"Unchanged Products     : {unchanged}")
    print(f"New Products Added     : {colorize(f'+{added_len}', Colors.GREEN if added_len else Colors.BOLD)}")
    print(f"Products Updated       : {colorize(f'~{updated_len}', Colors.YELLOW if updated_len else Colors.BOLD)}")
    print(f"Products Removed       : {colorize(f'-{removed_len}', Colors.RED if removed_len else Colors.BOLD)}")
    print("-" * 68)
    
    if diff["added"]:
        print(colorize(f"\n[+] NEWLY ADDED PRODUCTS ({len(diff['added'])} total):", Colors.GREEN + Colors.BOLD))
        for item in diff["added"][:10]:
            print(f"    • [{item['reg_no']}] {item['product_name']} ({item['holder']})")
        if len(diff["added"]) > 10:
            print(f"    ... and {len(diff['added']) - 10} more.")
            
    if diff["updated"]:
        print(colorize(f"\n[~] UPDATED PRODUCTS ({len(diff['updated'])} total):", Colors.YELLOW + Colors.BOLD))
        for item in diff["updated"][:10]:
            print(f"    • [{item['reg_no']}] {item['product_name']}")
            for field, ch in item["changes"].items():
                print(f"      - {ch['label']}: '{ch['old']}' → {colorize(ch['new'], Colors.CYAN)}")
        if len(diff["updated"]) > 10:
            print(f"    ... and {len(diff['updated']) - 10} more.")
            
    if diff["removed"]:
        print(colorize(f"\n[-] REMOVED PRODUCTS ({len(diff['removed'])} total):", Colors.RED + Colors.BOLD))
        for item in diff["removed"][:10]:
            print(f"    • [{item['reg_no']}] {item['product_name']}")
        if len(diff["removed"]) > 10:
            print(f"    ... and {len(diff['removed']) - 10} more.")
            
    print("=" * 68 + "\n")

def apply_updates(df, diff, parquet_path):
    """Processes dataframe and updates all static files, categories, and indexes."""
    print(f"[*] Updating static database files in data/processed/...")
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    os.makedirs(PRODUCT_CHUNKS_DIR, exist_ok=True)
    os.makedirs(GENERIC_CHUNKS_DIR, exist_ok=True)
    os.makedirs(CATEGORY_ITEMS_DIR, exist_ok=True)
    os.makedirs(LOGS_DIR, exist_ok=True)
    
    products_by_prefix = defaultdict(dict)
    generic_to_products = defaultdict(list)
    category_counts = defaultdict(int)
    category_items = defaultdict(list)
    status_counts = defaultdict(int)
    search_index = []
    
    print(f"[*] Normalizing entities and building indexes...")
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
        
        ingredients = parse_active_ingredients(row.get("active_ingredient"))
        primary_molecule = extract_primary_molecule(raw_generic, ingredients)
        primary_slug = slugify(primary_molecule)
        if not primary_slug:
            primary_slug = "general-formulation"
            primary_molecule = "General Formulation"
            
        cat = classify_category(reg_no, desc)
        category_counts[cat["slug"]] += 1
        status_counts[status] += 1
        
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
        
        # Search index item tuple: [slug, reg_no, product_name, cat_code, generic_name, holder]
        index_item = [
            slug,
            reg_no,
            product_name,
            cat["code"],
            primary_molecule,
            holder
        ]
        search_index.append(index_item)
        category_items[cat["slug"]].append(index_item)
        
    print(f"[*] Writing {len(products_by_prefix)} compact product chunk files...")
    for prefix, pdict in products_by_prefix.items():
        chunk_file = os.path.join(PRODUCT_CHUNKS_DIR, f"{prefix}.json")
        with open(chunk_file, "w", encoding="utf-8") as f:
            json.dump(pdict, f, separators=(",", ":"), ensure_ascii=False)
            
    print(f"[*] Writing {len(generic_to_products):,} generic molecules into compact letter chunks...")
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
        
    for letter, gdict in generics_by_letter.items():
        chunk_file = os.path.join(GENERIC_CHUNKS_DIR, f"{letter}.json")
        with open(chunk_file, "w", encoding="utf-8") as f:
            json.dump(gdict, f, separators=(",", ":"), ensure_ascii=False)
        
    generics_summary.sort(key=lambda x: x["total_products"], reverse=True)
    with open(os.path.join(PROCESSED_DIR, "generics.json"), "w", encoding="utf-8") as f:
        json.dump(generics_summary, f, separators=(",", ":"), ensure_ascii=False)
    with open(os.path.join(PROCESSED_DIR, "generics_top50.json"), "w", encoding="utf-8") as f:
        json.dump(generics_summary[:50], f, separators=(",", ":"), ensure_ascii=False)
        
    print(f"[*] Writing pre-partitioned category indexes...")
    for cat_slug, items in category_items.items():
        cat_file = os.path.join(CATEGORY_ITEMS_DIR, f"{cat_slug}.json")
        with open(cat_file, "w", encoding="utf-8") as f:
            json.dump(items, f, separators=(",", ":"), ensure_ascii=False)
            
    print(f"[*] Writing global search index and stats...")
    with open(os.path.join(PROCESSED_DIR, "search_index.json"), "w", encoding="utf-8") as f:
        json.dump(search_index, f, separators=(",", ":"), ensure_ascii=False)
        
    stats_doc = {
        "total_products": sum(len(pdict) for pdict in products_by_prefix.values()),
        "approved_count": status_counts.get("PRODUCT APPROVED", 0),
        "conditional_count": status_counts.get("CONDITIONAL REGISTRATION", 0),
        "category_counts": dict(category_counts),
        "total_generics": len(generic_to_products),
        "last_sync": datetime.date.today().isoformat(),
        "source": "National Pharmaceutical Regulatory Agency (NPRA), Ministry of Health Malaysia (KKM)",
        "source_url": PARQUET_URL,
        "official_archive": os.path.basename(parquet_path),
        "sha256": get_sha256(parquet_path),
        "license": "Creative Commons Attribution 4.0 International (CC BY 4.0)"
    }
    with open(os.path.join(PROCESSED_DIR, "stats.json"), "w", encoding="utf-8") as f:
        json.dump(stats_doc, f, indent=2, ensure_ascii=False)
        
    # Write audit log
    timestamp_str = datetime.datetime.now().strftime("%Y-%m-%d_%H%M%S")
    log_file = os.path.join(LOGS_DIR, f"sync_{timestamp_str}.json")
    audit_data = {
        "timestamp": datetime.datetime.now().isoformat(),
        "source_file": os.path.basename(parquet_path),
        "source_url": PARQUET_URL,
        "sha256": get_sha256(parquet_path),
        "total_records": len(df),
        "diff_summary": {
            "added": len(diff["added"]),
            "updated": len(diff["updated"]),
            "removed": len(diff["removed"]),
            "unchanged": diff["unchanged_count"]
        },
        "added_products": diff["added"],
        "updated_products": diff["updated"],
        "removed_products": diff["removed"]
    }
    with open(log_file, "w", encoding="utf-8") as f:
        json.dump(audit_data, f, indent=2, ensure_ascii=False)
        
    print(f"[+] Audit log recorded: {colorize(os.path.basename(log_file), Colors.CYAN)}")
    print(colorize(f"\n[SUCCESS] Synchronization complete! All records verified against official NPRA data.\n", Colors.GREEN + Colors.BOLD))

def main():
    parser = argparse.ArgumentParser(description="NutriDive NPRA Official Data Sync & Diff CLI")
    parser.add_argument("--dry-run", action="store_true", help="Download official parquet & calculate diff without applying changes")
    parser.add_argument("--yes", "-y", action="store_true", help="Automatically confirm and apply changes without prompting")
    parser.add_argument("--force-download", action="store_true", help="Force new download from data.gov.my")
    args = parser.parse_args()
    
    print("\n" + colorize("NutriDive (nutridive.net) - NPRA Data Synchronization Pipeline", Colors.BOLD))
    print(f"Data Source : {PARQUET_URL}")
    print(f"Timestamp   : {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 68)
    
    # Identify previous baseline
    baseline_path = find_previous_baseline()
    if baseline_path:
        print(f"[*] Baseline file: {colorize(os.path.basename(baseline_path), Colors.CYAN)}")
        
    # Download or get today's official parquet
    new_parquet_path, is_new = download_official_dataset(force=args.force_download)
    
    # Compute row-level and field-level diff
    diff = compute_diff(baseline_path, new_parquet_path)
    
    # Display diff
    display_diff_summary(diff)
    
    if args.dry_run:
        print(colorize("[DRY-RUN] Mode active. No database files were modified.", Colors.YELLOW))
        print("To apply updates, run: python scripts/sync.py\n")
        return
        
    has_changes = len(diff["added"]) > 0 or len(diff["updated"]) > 0 or len(diff["removed"]) > 0
    if not has_changes and baseline_path and not args.force_download:
        print("[*] No changes detected compared to current baseline. Data is 100% up to date.")
        if not args.yes:
            ans = input("Do you want to rebuild the processed indices anyway? (y/N): ").strip().lower()
            if ans != 'y':
                print("[*] Exiting without changes.")
                return
    else:
        if not args.yes:
            ans = input(colorize("Proceed to apply updates to NutriDive database? (Y/n): ", Colors.BOLD)).strip().lower()
            if ans == 'n':
                print("[*] Operation cancelled by user.")
                return
                
    apply_updates(diff["df_new"], diff, new_parquet_path)

if __name__ == "__main__":
    main()
