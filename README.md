# NutriDive (nutridive.net)
### Malaysia NPRA Pharmaceutical & Supplement Verification Engine

NutriDive is a high-performance open-data verification engine and generic drug alternative directory for **28,170+ approved medicines, health supplements (MAL-N), and traditional herbal remedies (MAL-T)** officially registered with the National Pharmaceutical Regulatory Agency (NPRA), Ministry of Health Malaysia (Kementerian Kesihatan Malaysia - KKM).

---

## Key Features

1. **NPRA & KKM Instant Verification**:
   - Check validity of any Malaysian registration number (e.g. `MAL19900523AZ`).
   - Real-time `ACTIVE & APPROVED` or `CONDITIONAL REGISTRATION` status display with validity dates.

2. **Generic Drug Alternative Engine**:
   - Compares 5,100+ generic active molecules.
   - Discovers all equivalent registered brand formulations sharing identical active pharmaceutical ingredients (API) in Malaysia.
   - Highlights Prescription (MAL-A) vs. Over-The-Counter (MAL-X) accessibility.

3. **Active Ingredients & Strength Formulation Matrix**:
   - Granular breakdown of declared active substances and concentration per unit dose.

4. **KKM Hologram Meditag™ & FarmaChecker Guide**:
   - Consumer verification checklist and step-by-step security hologram verification guidance.

5. **AI SEO & Answer Engine Optimization (AIO)**:
   - Zero-ambiguity 2-sentence summary block structured for LLM RAG ingestion.
   - Full `/public/llms.txt` and `/public/llms-full.txt` API documentation for AI search crawlers.
   - Schema.org JSON-LD structured data (`Drug`, `DietarySupplement`, `BreadcrumbList`, `FAQPage`).

6. **Affiliate & Telehealth Hooks**:
   - Licensed pharmacy pricing checks for OTC / supplements (Watsons, Guardian).
   - Telehealth prescription renewal doctor consultation hooks for scheduled poisons (DoctorOnCall).

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with Incremental Static Regeneration (ISR)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS + Swiss modernist digital archive aesthetic
- **Icons**: Lucide React
- **Data Pipeline**: Python 3 (PyArrow, Pandas) ingestion from official `data.gov.my` parquet dataset
- **Deployment Target**: Cloudflare Pages / Vercel

---

## Data Pipeline & Ingestion

The ingestion pipeline downloads the official dataset from data.gov.my and produces optimized JSON partitions and search indexes:

```bash
python scripts/ingest.py
```

Outputs:
- `data/processed/products/`: Partitioned single-product records
- `data/processed/search_index.json`: Fast search index
- `data/processed/generic_map/`: Cross-reference maps for 5,100+ generic molecules
- `data/processed/generics.json`: Ranked generic molecules directory
- `data/processed/categories.json`: NPRA classification definitions and metrics
- `data/processed/stats.json`: Aggregate dataset statistics

---

## Development & Build

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# TypeScript type check
npx tsc --noEmit

# Linting
npm run lint

# Production build
npm run build

# Start production server
npm run start
```

---

## License & Attribution

- **Administrative Data Source**: National Pharmaceutical Regulatory Agency (NPRA), Ministry of Health Malaysia (KKM) via [data.gov.my](https://data.gov.my/data-catalogue/pharmaceutical_products).
- **Data License**: Creative Commons Attribution 4.0 International ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)).
- **Disclaimer**: NutriDive is an independent open-data directory providing public regulatory records for educational and informational purposes. NutriDive is not affiliated with KKM or NPRA.
