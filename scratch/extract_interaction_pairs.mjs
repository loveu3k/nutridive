import fs from 'fs';
import path from 'path';

// Load data
const rules = JSON.parse(fs.readFileSync('data/rules/interactions.json', 'utf-8'));
const aliases = JSON.parse(fs.readFileSync('data/aliases/drugs.json', 'utf-8'));
const medline = JSON.parse(fs.readFileSync('data/rules/medline_dietary_rules.json', 'utf-8'));
const foods = JSON.parse(fs.readFileSync('data/rules/food_ontology.json', 'utf-8'));

console.log('--- Analyzing Potential Clinical Interaction Pairs ---');

// Map classId to aliases
const classToAliases = new Map();
aliases.forEach(a => {
  if (!classToAliases.has(a.classId)) classToAliases.set(a.classId, []);
  classToAliases.get(a.classId).push(a.keyword);
});

// Collect all pairs
const pairs = new Map();

function addPair(itemA, itemB, details) {
  const normA = itemA.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  const normB = itemB.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  if (normA === normB || !normA || !normB) return;

  // Canonical order to avoid A-and-B vs B-and-A duplicates
  const [first, second] = [normA, normB].sort();
  const slug = `${first}-and-${second}`;

  if (!pairs.has(slug)) {
    pairs.set(slug, {
      slug,
      substanceA: itemA,
      substanceB: itemB,
      ...details
    });
  }
}

// 1. From interactions.json redFlags
for (const rule of rules) {
  const drugName = rule.displayName || rule.classId;
  for (const rf of (rule.redFlags || [])) {
    addPair(drugName, rf.item, {
      type: 'CLINICAL_CONFLICT',
      severity: rf.severity || 'HIGH',
      clinicalReason: rf.reason,
      source: 'openFDA & NIH Clinical Database'
    });
  }
}

// 2. From MedlinePlus specific dietary/food rules
for (const med of medline) {
  if (med.hasSpecialDiet && med.specialDietaryInstructions) {
    if (/grapefruit/i.test(med.specialDietaryInstructions)) {
      addPair(med.drugName, 'Grapefruit', {
        type: 'DRUG_FOOD',
        severity: 'HIGH',
        clinicalReason: med.specialDietaryInstructions,
        source: 'NLM MedlinePlus Patient Dietary Instructions'
      });
    }
    if (/alcohol/i.test(med.specialDietaryInstructions)) {
      addPair(med.drugName, 'Alcohol', {
        type: 'DRUG_FOOD',
        severity: 'HIGH',
        clinicalReason: med.specialDietaryInstructions,
        source: 'NLM MedlinePlus Patient Dietary Instructions'
      });
    }
    if (/potassium|salt substitute/i.test(med.specialDietaryInstructions)) {
      addPair(med.drugName, 'Potassium Salt Substitutes', {
        type: 'DRUG_FOOD',
        severity: 'HIGH',
        clinicalReason: med.specialDietaryInstructions,
        source: 'NLM MedlinePlus Patient Dietary Instructions'
      });
    }
  }
}

// 3. From Food Ontology
for (const food of foods) {
  for (const confClass of (food.conflictingClasses || [])) {
    const matchingRule = rules.find(r => r.classId === confClass);
    if (matchingRule) {
      addPair(matchingRule.displayName, food.name.split(' (')[0], {
        type: 'DRUG_FOOD',
        severity: 'CRITICAL',
        clinicalReason: food.bioactiveCompounds ? food.bioactiveCompounds.map(c => c.clinicalDescription).join(' ') : food.guidance,
        source: 'Clinical Food & Nutrient Care Ontology'
      });
    }
  }
}

console.log(`Total substantive pairwise interactions generated: ${pairs.size}`);
const sample = Array.from(pairs.values()).slice(0, 10);
console.log('Sample pairs:');
sample.forEach(p => console.log(`- /interactions/${p.slug} [${p.severity}] ${p.substanceA} ↔ ${p.substanceB}`));
