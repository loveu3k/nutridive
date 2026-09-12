# NutriDive SafeStack (nutridive.net)
### Evidence-Based Medication, Supplement & Food Interaction Engine

NutriDive SafeStack is a fast, deterministic, zero-cost Drug-Supplement-Food Interaction Checker and daily regimen optimizer formulated from clinical pharmacology and nutritional biochemistry rules.

---

## Key Capabilities

1. **🔴 Critical Red Flag Contraindications**:
   - Instant identification of severe food-drug hazards (e.g., Grapefruit/Pomelo inhibiting intestinal CYP3A4 for statins, High-dose Vitamin K reversing Warfarin, Red Yeast Rice compounding statin liver toxicity).

2. **🟡 Bioavailability & Timing Separation Protocol**:
   - Detection of divalent cation binding and competitive absorption bottlenecks (e.g., Calcium/Iron binding Levothyroxine; spacing requirements for mineral supplements).

3. **🟢 Drug-Induced Nutrient Depletion (DIND) Radar**:
   - Automatic flagging of micronutrient depletions caused by chronic drug regimens (e.g., Statin-induced CoQ10 reduction, Metformin-induced Vitamin B12 depletion) with actionable replenishment guidance.

4. **📅 Circadian Daily Administration Schedule**:
   - Intelligent multi-slot allocation (Morning on empty stomach, Midday/With meals, Evening/Bedtime) optimizing therapeutic efficacy and gut tolerance.

5. **📥 Printable Kitchen Fridge Protocol**:
   - Single-click export of a high-resolution safety report (`html-to-image`) formatted to print and stick on the kitchen refrigerator.

---

## Knowledge Base Architecture

The interaction engine operates purely offline with static, version-controlled clinical rules:

- **`data/aliases/drugs.json`**: Keyword-to-canonical class mappings across generic drug names, proprietary brand formulations, and dietary nutraceuticals.
- **`data/rules/interactions.json`**: Clinical interaction rules defining contraindications, timing separations, nutrient depletions, and circadian slots.
- **`lib/checker.ts`**: Pure deterministic in-memory evaluation engine without external API dependencies or runtime latency.

---

## Scientific Reference Standards

Rules are distilled from established clinical references:
- *Krause and Mahan’s Food & the Nutrition Care Process*
- NIH Clinical Pharmacokinetics monographs & Open Drug Standards
- Clinical pharmacology pharmacopoeial interaction compendia

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **Visual Export**: `html-to-image`
- **Icons**: Lucide React
- **Deployment**: Static / Edge compatible (Cloudflare Pages, Vercel)

---

## Development & Verification

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Code linting
npm run lint

# Production build
npm run build
```

---

## Disclaimer

NutriDive SafeStack is an educational risk screening tool. It does not provide medical advice, diagnosis, or prescriptions. Always consult a licensed doctor or clinical pharmacist before altering any medication or dietary supplement regimen.
