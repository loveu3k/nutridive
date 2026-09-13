import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = path.join(process.cwd(), 'data/rules/medline_dietary_rules.json');
const BASE_URL = 'https://medlineplus.gov';

/**
 * High-impact medication slugs on MedlinePlus representing common therapeutic classes
 * with known food, supplement, or alcohol restrictions.
 */
const HIGH_IMPACT_DRUGS = [
  { name: 'Warfarin', slug: 'meds/a682277.html', classId: 'warfarin' },
  { name: 'Atorvastatin (Lipitor)', slug: 'meds/a600045.html', classId: 'statin_cyp3a4' },
  { name: 'Simvastatin (Zocor)', slug: 'meds/a692030.html', classId: 'statin_cyp3a4' },
  { name: 'Lisinopril', slug: 'meds/a692015.html', classId: 'ace_inhibitors_angiotensin_converting_enzyme' },
  { name: 'Losartan', slug: 'meds/a695008.html', classId: 'angiotensin_receptor_blocker' },
  { name: 'Metformin', slug: 'meds/a696005.html', classId: 'biguanides' },
  { name: 'Levothyroxine', slug: 'meds/a682461.html', classId: 'levothyroxine' },
  { name: 'Amlodipine', slug: 'meds/a692044.html', classId: 'calcium_channel_blockers' },
  { name: 'Ciprofloxacin', slug: 'meds/a688016.html', classId: 'fluoroquinolones' },
  { name: 'Doxycycline', slug: 'meds/a682063.html', classId: 'tetracyclines' },
  { name: 'Spironolactone', slug: 'meds/a682627.html', classId: 'potassium_sparing_diuretics' },
  { name: 'Hydrochlorothiazide', slug: 'meds/a682571.html', classId: 'thiazide_diuretics' },
  { name: 'Omeprazole', slug: 'meds/a693050.html', classId: 'proton_pump_inhibitors' },
  { name: 'Alendronate (Fosamax)', slug: 'meds/a601011.html', classId: 'bisphosphonates' },
  { name: 'Methotrexate', slug: 'meds/a682018.html', classId: 'methotrexate' },
  { name: 'Carbidopa and Levodopa (Sinemet)', slug: 'meds/a601068.html', classId: 'dopamine_precursors' },
  { name: 'Digoxin', slug: 'meds/a682377.html', classId: 'cardiac_glycosides' },
  { name: 'Lithium', slug: 'meds/a681039.html', classId: 'lithium' },
  { name: 'Metronidazole', slug: 'meds/a689011.html', classId: 'nitroimidazoles' },
  { name: 'Phenelzine (Nardil - MAOI)', slug: 'meds/a682077.html', classId: 'monoamine_oxidase_inhibitors' },
  { name: 'Theophylline', slug: 'meds/a681006.html', classId: 'xanthines' },
  { name: 'Sildenafil (Viagra)', slug: 'meds/a699015.html', classId: 'phosphodiesterase_5_inhibitors' },
  { name: 'Alprazolam (Xanax)', slug: 'meds/a684001.html', classId: 'benzodiazepines' }
];

async function fetchWithRetry(url, retries = 3, delay = 400) {
  for (let i = 0; i < retries; i++) {
    try {
      await new Promise(r => setTimeout(r, delay));
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (res.ok) return await res.text();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, delay * (i + 2)));
    }
  }
  return null;
}

async function extractMedlineDietary() {
  console.log('\n[1/2] Fetching MedlinePlus Drug Monographs for Special Dietary Instructions...');
  const results = [];

  for (const drug of HIGH_IMPACT_DRUGS) {
    try {
      const url = `${BASE_URL}/druginfo/${drug.slug}`;
      const html = await fetchWithRetry(url);
      if (!html) continue;

      // Extract dietary section
      let dietaryText = null;
      const dietIdx = html.lastIndexOf('What special dietary instructions should I follow?');
      if (dietIdx !== -1) {
        const snippet = html.slice(dietIdx, dietIdx + 1500);
        // Clean snippet up to the next section or h2
        const nextHeading = snippet.search(/<h[23]|id="if-i-forget"|id="side-effects"/i);
        const rawDiet = nextHeading !== -1 ? snippet.slice(0, nextHeading) : snippet;
        dietaryText = rawDiet.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').replace(/^What special dietary instructions should I follow\?\s*/i, '').trim();
      }

      // Extract precautions section mentions of food, alcohol, vitamins, or supplements
      let precautionsSummary = null;
      const precIdx = html.lastIndexOf('What special precautions should I follow?');
      if (precIdx !== -1) {
        const precSnippet = html.slice(precIdx, precIdx + 2500);
        const matchFood = precSnippet.match(/(?:grapefruit|alcohol|vitamin|supplement|herb|potassium|dairy|mineral)[^.]*\./gi);
        if (matchFood) {
          precautionsSummary = matchFood.map(s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).join(' ');
        }
      }

      results.push({
        drugName: drug.name,
        classId: drug.classId,
        sourceUrl: url,
        specialDietaryInstructions: dietaryText || 'Continue normal diet unless physician advises otherwise.',
        keyPrecautions: precautionsSummary || null
      });

      console.log(`✓ Processed ${drug.name}`);
    } catch (e) {
      console.error(`Error with ${drug.name}:`, e.message);
    }
  }

  console.log(`\n[2/2] Saving MedlinePlus Dietary Guidance to ${OUTPUT_FILE}...`);
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`✅ Completed! Extracted dietary guidance for ${results.length} essential prescription drugs.`);
}

extractMedlineDietary().catch(console.error);
