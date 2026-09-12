# NutriDive SafeStack (nutridive.net)
### Evidence-Based Medication, Dietary Supplement & Food Interaction Radar

NutriDive SafeStack is a privacy-first, client-side clinical rule engine and kitchen safety sheet generator. It screens daily medications and supplements for harmful food-drug interactions, competitive absorption timing conflicts, and chronic nutrient depletions.

---

## Key Capabilities

1. **Critical Red Flags (Contraindications)**:
   - Identifies high-risk food-drug and supplement-drug conflicts backed by clinical pharmacokinetics (e.g., CYP3A4 inhibition from grapefruit with statins, lactic acidosis risks with metformin and alcohol, anticoagulant reversal with warfarin and vitamin K).

2. **Absorption Timing Separation Rules**:
   - Outlines precise interval guidelines for substances that compete for gut transporters or bind active agents (e.g., separating levothyroxine from calcium/iron by 4+ hours; separating divalent minerals like calcium, zinc, and magnesium).

3. **Nutrient Depletion & Replenishment Insights**:
   - Highlights secondary nutrient deficiencies caused by chronic medication use (e.g., statin-induced CoQ10 reduction, metformin-associated vitamin B12 malabsorption, ACE-inhibitor urinary zinc excretion).

4. **Printable Kitchen Fridge Safety Sheet**:
   - Renders a clean daily protocol card organized by intake timing (Morning on empty stomach, Midday with meal, Evening at bedtime).
   - Supports one-click high-resolution PNG export (`html-to-image`) for household and kitchen fridge reference.

5. **100% Local In-Memory Evaluation**:
   - Completely offline-capable; runs deterministic rule checking in the browser with zero latency and complete privacy—no personal health regimen is transmitted to remote servers.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Client Export**: `html-to-image`
- **Deployment**: Vercel / Cloudflare Pages

---

## Project Structure

```
├── app/
│   ├── layout.tsx         # Global layout & SEO metadata
│   ├── page.tsx           # SafeStack interactive landing page
│   ├── not-found.tsx      # 404 page
│   ├── globals.css        # Global design tokens & styling
│   ├── icon.tsx           # Dynamic favicon generator
│   ├── apple-icon.tsx     # Dynamic Apple touch icon generator
│   ├── robots.ts          # Search engine crawl rules
│   └── sitemap.ts         # Sitemap configuration
├── components/
│   └── SafetyCard.tsx     # Kitchen protocol card & PNG export
├── data/
│   ├── aliases/
│   │   └── drugs.json     # Brand/generic names to standard classId mapping
│   └── rules/
│       └── interactions.json # Deterministic interaction rules & depletions
├── lib/
│   ├── checker.ts         # Core stack evaluation engine
│   └── utils.ts           # Class merging helper (cn)
└── package.json
```

---

## Development & Build

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Code linting
npm run lint

# Production build
npm run build

# Start production server
npm run start
```

---

## Medical Disclaimer

NutriDive SafeStack provides general informational and educational guidance based on standard clinical literature (including *Krause and Mahan’s Food & the Nutrition Care Process* and NIH Open Drug references). It does not constitute formal medical diagnosis, treatment, or individualized clinical advice. Always consult a licensed healthcare professional or pharmacist before altering any prescribed medication regimen.
