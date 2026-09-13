import fs from 'fs';
import path from 'path';

const rules = JSON.parse(fs.readFileSync('data/rules/interactions.json', 'utf-8'));
const aliases = JSON.parse(fs.readFileSync('data/aliases/drugs.json', 'utf-8'));
const medline = JSON.parse(fs.readFileSync('data/rules/medline_dietary_rules.json', 'utf-8'));
const foods = JSON.parse(fs.readFileSync('data/rules/food_ontology.json', 'utf-8'));

// Common high-search clinical pairs (Gold Standard pairs)
const HIGH_PRIORITY_PAIRS = [
  ['warfarin', 'aspirin'],
  ['warfarin', 'spinach'],
  ['warfarin', 'ginkgo'],
  ['warfarin', 'garlic'],
  ['warfarin', 'curcumin'],
  ['warfarin', 'omega-3'],
  ['warfarin', 'coq10'],
  ['warfarin', 'st-johns-wort'],
  ['warfarin', 'alcohol'],
  ['atorvastatin', 'grapefruit'],
  ['atorvastatin', 'grapefruit-juice'],
  ['simvastatin', 'grapefruit'],
  ['lisinopril', 'spironolactone'],
  ['lisinopril', 'potassium'],
  ['lisinopril', 'salt-substitute'],
  ['losartan', 'potassium'],
  ['ciprofloxacin', 'calcium'],
  ['ciprofloxacin', 'milk'],
  ['ciprofloxacin', 'iron'],
  ['ciprofloxacin', 'dairy'],
  ['ciprofloxacin', 'probiotics'],
  ['ciprofloxacin', 'caffeine'],
  ['ciprofloxacin', 'coffee'],
  ['levothyroxine', 'calcium'],
  ['levothyroxine', 'iron'],
  ['levothyroxine', 'coffee'],
  ['levothyroxine', 'ashwagandha'],
  ['sildenafil', 'nitroglycerin'],
  ['tadalafil', 'nitroglycerin'],
  ['metformin', 'alcohol'],
  ['metformin', 'vitamin-b12'],
  ['ibuprofen', 'aspirin'],
  ['omeprazole', 'calcium'],
  ['omeprazole', 'magnesium'],
  ['omeprazole', 'vitamin-b12'],
  ['phenelzine', 'aged-cheese'],
  ['phenelzine', 'tyramine'],
  ['spironolactone', 'salt-substitute'],
  ['theophylline', 'coffee'],
  ['theophylline', 'caffeine'],
  ['alprazolam', 'alcohol'],
  ['alprazolam', 'kava'],
  ['zinc', 'copper'],
  ['calcium', 'iron'],
  ['vitamin-c', 'iron'],
  ['vitamin-d', 'calcium'],
  ['amlodipine', 'grapefruit'],
  ['methotrexate', 'folate'],
  ['methotrexate', 'alcohol'],
  ['lithium', 'nsaids'],
  ['lithium', 'caffeine'],
  ['digoxin', 'licorice'],
  ['digoxin', 'potassium'],
  ['carbidopa-levodopa', 'iron'],
  ['alendronate', 'calcium'],
  ['alendronate', 'coffee'],
  ['metronidazole', 'alcohol']
];

const pairMap = new Map();

function registerPair(subA, subB, meta = {}) {
  const normA = subA.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  const normB = subB.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  if (normA === normB || !normA || !normB) return;

  const [first, second] = [normA, normB].sort();
  const slug = `${first}-and-${second}`;

  if (!pairMap.has(slug)) {
    pairMap.set(slug, {
      slug,
      substanceA: subA,
      substanceB: subB,
      ...meta
    });
  }
}

// 1. Register High Priority Pairs
HIGH_PRIORITY_PAIRS.forEach(([a, b]) => {
  registerPair(a, b, { priority: 1.0 });
});

// 2. Register Grapefruit / Alcohol / Potassium pairs from MedlinePlus
for (const med of medline) {
  if (med.hasSpecialDiet && med.specialDietaryInstructions) {
    const dName = med.genericName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    if (/grapefruit/i.test(med.specialDietaryInstructions)) {
      registerPair(dName, 'grapefruit', { priority: 0.9 });
      registerPair(dName, 'grapefruit-juice', { priority: 0.8 });
    }
    if (/alcohol/i.test(med.specialDietaryInstructions)) {
      registerPair(dName, 'alcohol', { priority: 0.9 });
    }
    if (/potassium|salt substitute/i.test(med.specialDietaryInstructions)) {
      registerPair(dName, 'potassium', { priority: 0.8 });
      registerPair(dName, 'salt-substitute', { priority: 0.8 });
    }
  }
}

// 3. Register Food Ontology pairs
for (const food of foods) {
  const fName = food.keywords[0].toLowerCase().replace(/\s+/g, '-');
  for (const conf of (food.conflictingClasses || [])) {
    // Find sample drugs in this class
    const sampleDrugs = aliases.filter(a => a.classId === conf).slice(0, 3);
    for (const d of sampleDrugs) {
      registerPair(d.keyword.replace(/\s+/g, '-'), fName, { priority: 0.8 });
    }
  }
}

// 4. Register openFDA high-impact redFlags
for (const rule of rules.slice(0, 200)) {
  const dName = rule.displayName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  for (const rf of (rule.redFlags || []).slice(0, 4)) {
    const rfItem = rf.item.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    if (rfItem.length > 2 && rfItem.length < 30) {
      registerPair(dName, rfItem, { priority: 0.7 });
    }
  }
}

const allPairs = Array.from(pairMap.values());
console.log(`Generated ${allPairs.length} high-value clinical interaction pairs.`);

const outPath = path.join(process.cwd(), 'data/rules/interaction_pairs.json');
fs.writeFileSync(outPath, JSON.stringify(allPairs, null, 2), 'utf-8');
console.log(`Saved to ${outPath}`);
