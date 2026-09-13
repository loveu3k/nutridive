import fs from 'fs';
import path from 'path';

const INPUT_EXTRACTED = path.join(process.cwd(), 'data/rules/extracted_food_rules.json');
const INPUT_ALIASES = path.join(process.cwd(), 'data/aliases/drugs.json');
const OUTPUT_RULES = path.join(process.cwd(), 'data/rules/interactions.json');

// 1. Curated Clinical Core Benchmark Rules (Gold standard pharmacological rules)
const CURATED_BENCHMARKS = [
  {
    classId: 'statin_cyp3a4',
    displayName: 'Statin (CYP3A4 Substrate - Atorvastatin, Simvastatin, Lovastatin)',
    recommendedSlot: 'evening',
    redFlags: [
      {
        item: 'Grapefruit / Pomelo (Furanocoumarins)',
        reason: 'Irreversibly inhibits intestinal CYP3A4 enzymes, raising serum statin concentrations up to 12-fold and dramatically increasing the risk of rhabdomyolysis and renal failure.',
        severity: 'CRITICAL'
      },
      {
        item: 'Red Yeast Rice (Monacolin K)',
        reason: 'Contains naturally occurring lovastatin; concurrent consumption results in uncontrolled statin overdose and severe hepatotoxicity.',
        severity: 'CRITICAL'
      }
    ],
    timingRules: [],
    depletions: [
      {
        nutrient: 'Coenzyme Q10 (CoQ10)',
        advice: 'Statins inhibit the mevalonate pathway, depleting cellular ubiquinone. Consider 100-200 mg CoQ10 daily with meals if experiencing statin-associated muscle aches (SAMS).'
      }
    ]
  },
  {
    classId: 'metformin',
    displayName: 'Biguanide (Metformin)',
    recommendedSlot: 'afternoon',
    redFlags: [
      {
        item: 'Binge Drinking / Empty-Stomach Alcohol',
        reason: 'Acute ethanol consumption potentiates metformin-associated inhibition of hepatic lactate utilization, precipitating potentially fatal lactic acidosis.',
        severity: 'CRITICAL'
      }
    ],
    timingRules: [],
    depletions: [
      {
        nutrient: 'Vitamin B12 (Cobalamin)',
        advice: 'Chronic metformin therapy impairs ileal calcium-dependent absorption of the B12-intrinsic factor complex. Annual serum B12 testing or oral B12 supplementation is strongly advised.'
      }
    ]
  },
  {
    classId: 'levothyroxine',
    displayName: 'Thyroid Hormone (Levothyroxine)',
    recommendedSlot: 'morning',
    redFlags: [
      {
        item: 'Soy Protein / High-Fiber Diets / Walnuts',
        reason: 'Significantly binds free levothyroxine within the gastrointestinal tract, leading to erratic absorption and unmanaged hypothyroidism.',
        severity: 'HIGH'
      }
    ],
    timingRules: [
      {
        conflictingWith: 'Calcium, Iron, Magnesium & Antacids',
        rule: 'Take Levothyroxine with plain water 30-60 minutes before breakfast; separate from Calcium, Iron, and Multivitamins by at least 4 hours.'
      }
    ],
    depletions: []
  },
  {
    classId: 'warfarin',
    displayName: 'Vitamin K Antagonist (Warfarin / Coumadin)',
    recommendedSlot: 'evening',
    redFlags: [
      {
        item: 'Variable High-Vitamin K Foods (Spinach, Kale, Natto, Brussels Sprouts)',
        reason: 'Vitamin K directly bypasses VKORC1 inhibition, rapidly dropping INR and triggering catastrophic stroke or thromboembolic events.',
        severity: 'CRITICAL'
      },
      {
        item: 'High-Dose Fish Oil (>3g), Ginkgo Biloba, Garlic Extract & Dong Quai',
        reason: 'Additive antiplatelet and antithrombotic mechanisms significantly increase spontaneous internal and intracranial bleeding risks.',
        severity: 'CRITICAL'
      }
    ],
    timingRules: [],
    depletions: []
  },
  {
    classId: 'ace_inhibitor',
    displayName: 'ACE Inhibitor / Angiotensin Receptor Blocker (ARB)',
    recommendedSlot: 'morning',
    redFlags: [
      {
        item: 'Potassium-Enriched Salt Substitutes & High-Potassium Supplements',
        reason: 'Suppression of aldosterone causes renal potassium retention; potassium salt substitutes can trigger sudden, life-threatening hyperkalemic cardiac arrest.',
        severity: 'CRITICAL'
      }
    ],
    timingRules: [],
    depletions: [
      {
        nutrient: 'Zinc',
        advice: 'ACE inhibitors cause modest chelation and increased urinary excretion of zinc; ensure dietary intake of zinc-rich foods (pumpkin seeds, poultry).'
      }
    ]
  },
  {
    classId: 'ppi_omeprazole',
    displayName: 'Proton Pump Inhibitor (Omeprazole, Pantoprazole, Esomeprazole)',
    recommendedSlot: 'morning',
    redFlags: [],
    timingRules: [
      {
        conflictingWith: 'Acid-Dependent Nutrients (Iron, Calcium Carbonate)',
        rule: 'Take PPI 30-60 minutes before first meal of the day. If taking iron or calcium supplements, consider calcium citrate (which does not require acid) or take supplements at lunch.'
      }
    ],
    depletions: [
      {
        nutrient: 'Magnesium',
        advice: 'Long-term PPI use impairs intestinal TRPM6/7 magnesium active transport, leading to hypomagnesemia. Consider 200-400 mg magnesium glycinate.'
      },
      {
        nutrient: 'Vitamin B12',
        advice: 'Gastric acid suppression prevents extraction of protein-bound B12 from food. Periodic B12 screening is recommended.'
      }
    ]
  },
  {
    classId: 'bisphosphonates',
    displayName: 'Bisphosphonates (Alendronate, Risedronate, Ibandronate)',
    recommendedSlot: 'morning',
    redFlags: [
      {
        item: 'Food, Milk, Coffee or Juice at Intake',
        reason: 'Oral bioavailability of bisphosphonates is under 1% and is completely negated by food, dairy, or non-water liquids. Must take on empty stomach with plain water.',
        severity: 'CRITICAL'
      }
    ],
    timingRules: [
      {
        conflictingWith: 'All Foods, Beverages, Calcium & Other Medications',
        rule: 'Swallow whole with 8 oz plain water upon waking. Stay upright (do not lie down) and ingest nothing for at least 30 to 60 minutes to prevent severe esophageal ulceration.'
      }
    ],
    depletions: []
  },
  {
    classId: 'fluoroquinolones',
    displayName: 'Fluoroquinolones (Ciprofloxacin, Levofloxacin, Moxifloxacin)',
    recommendedSlot: 'morning',
    redFlags: [
      {
        item: 'High-Dose Caffeine / Energy Drinks',
        reason: 'Ciprofloxacin inhibits CYP1A2, reducing caffeine clearance by 33-85% and precipitating severe palpitations, tremors, and anxiety.',
        severity: 'HIGH'
      }
    ],
    timingRules: [
      {
        conflictingWith: 'Dairy Products (Milk, Yogurt) & Mineral Supplements (Ca, Mg, Fe, Zn)',
        rule: 'Multivalent cations bind fluoroquinolones in the gut, reducing absorption by up to 90%. Administer at least 2 hours before or 4 to 6 hours after dairy or mineral supplements.'
      }
    ],
    depletions: []
  },
  {
    classId: 'tetracyclines',
    displayName: 'Tetracyclines (Doxycycline, Minocycline)',
    recommendedSlot: 'afternoon',
    redFlags: [],
    timingRules: [
      {
        conflictingWith: 'Milk, Dairy, Iron & Calcium Supplements',
        rule: 'Divalent and trivalent cations form insoluble chelates with tetracyclines. Separate intake from milk and mineral supplements by at least 2 to 3 hours.'
      }
    ],
    depletions: []
  },
  {
    classId: 'maoi_antidepressant',
    displayName: 'Monoamine Oxidase Inhibitor (MAOI - Phenelzine, Tranylcypromine, Linezolid)',
    recommendedSlot: 'morning',
    redFlags: [
      {
        item: 'Tyramine-Rich Aged Foods (Aged Cheese, Cured Meats, Tap Beer, Fermented Soy)',
        reason: 'MAO inhibition prevents gastrointestinal degradation of dietary tyramine, displacing systemic norepinephrine and inducing lethal hypertensive crises and stroke.',
        severity: 'CRITICAL'
      }
    ],
    timingRules: [],
    depletions: []
  },
  {
    classId: 'corticosteroids',
    displayName: 'Systemic Corticosteroids (Prednisone, Methylprednisolone, Dexamethasone)',
    recommendedSlot: 'morning',
    redFlags: [
      {
        item: 'Alcohol / High-Sodium Foods',
        reason: 'Steroids promote fluid retention and gastric irritation. Concomitant alcohol sharply multiplies gastric ulcer risks.',
        severity: 'HIGH'
      }
    ],
    timingRules: [],
    depletions: [
      {
        nutrient: 'Calcium & Vitamin D',
        advice: 'Corticosteroids inhibit intestinal calcium absorption and accelerate bone resorption. Co-supplementation with 1000 mg Calcium and 1000-2000 IU Vitamin D3 is standard clinical practice.'
      },
      {
        nutrient: 'Potassium',
        advice: 'Glucocorticoid receptor activation increases urinary potassium excretion; ensure potassium-dense dietary intake.'
      }
    ]
  },
  {
    classId: 'diuretics_loop_thiazide',
    displayName: 'Diuretics (Furosemide, Hydrochlorothiazide, Torsemide)',
    recommendedSlot: 'morning',
    redFlags: [
      {
        item: 'Natural Black Licorice (Glycyrrhizin)',
        reason: 'Glycyrrhizin inhibits 11-beta-HSD2, compounding renal potassium wasting and provoking severe, life-threatening hypokalemic arrhythmias.',
        severity: 'CRITICAL'
      }
    ],
    timingRules: [],
    depletions: [
      {
        nutrient: 'Potassium & Magnesium',
        advice: 'Inhibits renal tubular electrolyte reabsorption. Monitor serum electrolytes; magnesium supplementation is often required to restore potassium homeostasis.'
      },
      {
        nutrient: 'Vitamin B1 (Thiamine)',
        advice: 'Increased urine flow accelerates urinary loss of water-soluble thiamine, especially in heart failure patients.'
      }
    ]
  },
  {
    classId: 'mineral_calcium',
    displayName: 'Calcium Supplement (Carbonate / Citrate)',
    recommendedSlot: 'afternoon',
    redFlags: [
      {
        item: 'High-Oxalate Raw Greens (Spinach, Swiss Chard, Rhubarb)',
        reason: 'Oxalic acid binds free calcium into insoluble calcium oxalate, rendering it unabsorbable and increasing kidney stone burden.',
        severity: 'MEDIUM'
      }
    ],
    timingRules: [
      {
        conflictingWith: 'Iron, Zinc, Levothyroxine, Fluoroquinolones & Tetracyclines',
        rule: 'Competes for divalent metal transporters (DMT-1) and chelates active pharmaceutical agents. Separate calcium by at least 2-4 hours from iron, thyroid, and antibiotic doses.'
      }
    ],
    depletions: []
  },
  {
    classId: 'mineral_iron',
    displayName: 'Iron Supplement (Ferrous Sulfate / Bisglycinate)',
    recommendedSlot: 'morning',
    redFlags: [
      {
        item: 'Black Tea, Coffee, Milk, Calcium & Antacids',
        reason: 'Tannins, polyphenols, and calcium form unabsorbable iron complexes, dropping non-heme iron absorption by 60-80%.',
        severity: 'HIGH'
      }
    ],
    timingRules: [
      {
        conflictingWith: 'Calcium, Zinc, Multivitamins, Thyroid & Antibiotics',
        rule: 'Take on empty stomach with Vitamin C / orange juice for optimal absorption. Separate from calcium, zinc, and antibiotics by at least 2 to 3 hours.'
      }
    ],
    depletions: []
  },
  {
    classId: 'supp_omega3',
    displayName: 'Omega-3 Fish Oil (EPA / DHA)',
    recommendedSlot: 'afternoon',
    redFlags: [
      {
        item: 'Prescription Anticoagulants (High Doses >3g daily)',
        reason: 'Mildly inhibits platelet cyclooxygenase; high doses co-administered with warfarin or DOACs may prolong bleeding time.',
        severity: 'MEDIUM'
      }
    ],
    timingRules: [],
    depletions: []
  }
];

// Clinical keywords for automated extraction classification
const CLINICAL_INTERACTION_INDICATORS = [
  'avoid', 'contraindicated', 'increase', 'decrease', 'inhibit', 'induce',
  'absorption', 'chelat', 'metabolism', 'bleeding', 'toxic', 'serum', 'caution',
  'concomitant', 'adverse', 'potentiate', 'acidosis', 'hypotension', 'sedation'
];

function isLegitimateInteraction(excerpt) {
  const lower = excerpt.toLowerCase();
  // Filter out topical prep / inactive excipient mentions
  if (lower.includes('clean and dry') || lower.includes('rub alcohol') || lower.includes('inactive ingredient')) {
    return false;
  }
  return CLINICAL_INTERACTION_INDICATORS.some(ind => lower.includes(ind));
}

function cleanClassName(rawClassId) {
  return rawClassId
    .replace(/_epc$/, '')
    .replace(/_cs$/, '')
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function compileAllInteractions() {
  console.log('Starting full-spectrum clinical interaction compilation...');

  if (!fs.existsSync(INPUT_EXTRACTED)) {
    console.error(`Extracted rules not found at: ${INPUT_EXTRACTED}`);
    process.exit(1);
  }

  const rawDetections = JSON.parse(fs.readFileSync(INPUT_EXTRACTED, 'utf-8'));
  console.log(`Loaded ${rawDetections.length} raw extracted snippets.`);

  // Load alias dictionary to check class mapping
  let aliasClassMap = new Map();
  if (fs.existsSync(INPUT_ALIASES)) {
    const aliases = JSON.parse(fs.readFileSync(INPUT_ALIASES, 'utf-8'));
    aliases.forEach(a => {
      if (!aliasClassMap.has(a.classId)) {
        aliasClassMap.set(a.classId, a.name);
      }
    });
  }

  // Pre-seed with curated benchmark rules
  const rulesByClass = new Map();
  CURATED_BENCHMARKS.forEach(r => rulesByClass.set(r.classId, { ...r }));

  // Aggregate raw detections by drugClass
  const classDetections = new Map(); // classId -> Map(triggerFood -> [excerpts])

  for (const det of rawDetections) {
    if (!isLegitimateInteraction(det.excerpt)) continue;

    const classId = det.drugClass;
    if (!classDetections.has(classId)) {
      classDetections.set(classId, new Map());
    }

    const foodMap = classDetections.get(classId);
    if (!foodMap.has(det.triggerFood)) {
      foodMap.set(det.triggerFood, []);
    }
    foodMap.get(det.triggerFood).push(det);
  }

  console.log(`Clustered legitimate interactions across ${classDetections.size} pharmacological classes.`);

  // Synthesize rules for each class
  for (const [classId, foodMap] of classDetections.entries()) {
    let existingRule = rulesByClass.get(classId);

    if (!existingRule) {
      const sampleName = aliasClassMap.get(classId) || cleanClassName(classId);
      existingRule = {
        classId: classId,
        displayName: cleanClassName(classId),
        recommendedSlot: 'morning',
        redFlags: [],
        timingRules: [],
        depletions: []
      };
      rulesByClass.set(classId, existingRule);
    }

    // Determine slot based on class characteristics
    const lowerClass = classId.toLowerCase();
    if (lowerClass.includes('statin') || lowerClass.includes('sedative') || lowerClass.includes('sleep') || lowerClass.includes('anticoagulant')) {
      existingRule.recommendedSlot = 'evening';
    } else if (lowerClass.includes('biguanide') || lowerClass.includes('antidiabetic') || lowerClass.includes('nsaid')) {
      existingRule.recommendedSlot = 'afternoon';
    } else {
      existingRule.recommendedSlot = 'morning';
    }

    for (const [food, items] of foodMap.entries()) {
      const primaryItem = items[0];

      if (food === 'grapefruit' || food === 'pomelo') {
        const hasFlag = existingRule.redFlags.some(rf => rf.item.toLowerCase().includes('grapefruit'));
        if (!hasFlag) {
          existingRule.redFlags.push({
            item: 'Grapefruit / Pomelo (CYP3A4 Inhibition)',
            reason: 'Inhibits intestinal CYP3A4-mediated first-pass metabolism, elevating systemic drug concentrations and increasing toxic adverse effect risks.',
            severity: 'CRITICAL'
          });
        }
      } else if (food === 'alcohol' || food === 'ethanol') {
        const hasFlag = existingRule.redFlags.some(rf => rf.item.toLowerCase().includes('alcohol'));
        if (!hasFlag) {
          const isSedative = lowerClass.includes('opioid') || lowerClass.includes('benzodiazepine') || lowerClass.includes('sedative') || lowerClass.includes('cns');
          existingRule.redFlags.push({
            item: 'Alcohol / Ethanol',
            reason: isSedative
              ? 'Concomitant intake produces additive central nervous system and respiratory depression; risk of profound sedation, coma, or fatal respiratory arrest.'
              : 'Alcohol may enhance gastrointestinal irritation, trigger orthostatic hypotension, or alter drug absorption kinetics.',
            severity: isSedative ? 'CRITICAL' : 'HIGH'
          });
        }
      } else if (food === 'calcium' || food === 'dairy' || food === 'milk') {
        const hasTiming = existingRule.timingRules.some(tr => tr.conflictingWith.toLowerCase().includes('calcium') || tr.conflictingWith.toLowerCase().includes('dairy'));
        if (!hasTiming) {
          existingRule.timingRules.push({
            conflictingWith: 'Calcium, Dairy Products & High-Calcium Foods',
            rule: 'May form unabsorbable gastrointestinal chelates or compete for active mucosal transport. Separate administration by at least 2 to 4 hours.'
          });
        }
      } else if (food === 'iron') {
        const hasTiming = existingRule.timingRules.some(tr => tr.conflictingWith.toLowerCase().includes('iron'));
        if (!hasTiming) {
          existingRule.timingRules.push({
            conflictingWith: 'Oral Iron Supplements & Multivitamins with Minerals',
            rule: 'Divalent iron cations bind this medication in the gut lumen, reducing systemic absorption. Separate by at least 2 to 3 hours.'
          });
        }
      } else if (food === 'potassium' || food === 'salt substitute') {
        const hasFlag = existingRule.redFlags.some(rf => rf.item.toLowerCase().includes('potassium'));
        if (!hasFlag) {
          existingRule.redFlags.push({
            item: 'Potassium-Enriched Salt Substitutes & High-Potassium Regimens',
            reason: 'Additive potassium retention risks hyperkalemia, which can lead to life-threatening cardiac dysrhythmias.',
            severity: 'CRITICAL'
          });
        }
      } else if (food === 'tyramine') {
        const hasFlag = existingRule.redFlags.some(rf => rf.item.toLowerCase().includes('tyramine'));
        if (!hasFlag) {
          existingRule.redFlags.push({
            item: 'Tyramine-Rich Foods (Aged Cheese, Cured Meats, Fermented Foods)',
            reason: 'Compromised monoamine oxidase breakdown allows systemic tyramine accumulation, triggering acute hypertensive crisis.',
            severity: 'CRITICAL'
          });
        }
      } else if (food === "st. john's wort") {
        const hasFlag = existingRule.redFlags.some(rf => rf.item.toLowerCase().includes("st. john's wort"));
        if (!hasFlag) {
          existingRule.redFlags.push({
            item: "St. John's Wort (Hypericum perforatum)",
            reason: 'Strong CYP3A4 and P-glycoprotein induction leads to rapid clearance and therapeutic treatment failure.',
            severity: 'CRITICAL'
          });
        }
      } else if (food === 'vitamin k') {
        const hasFlag = existingRule.redFlags.some(rf => rf.item.toLowerCase().includes('vitamin k'));
        if (!hasFlag) {
          existingRule.redFlags.push({
            item: 'High Vitamin K Foods (Dark Leafy Greens, Natto)',
            reason: 'Directly interferes with anticoagulant mechanisms, lowering prothrombin time and raising thrombosis/stroke risks.',
            severity: 'CRITICAL'
          });
        }
      }
    }
  }

  const finalRulesArray = Array.from(rulesByClass.values());
  fs.writeFileSync(OUTPUT_RULES, JSON.stringify(finalRulesArray, null, 2), 'utf-8');

  console.log(`\n========================================`);
  console.log(`Compilation Complete!`);
  console.log(`Total Structured Clinical Rules: ${finalRulesArray.length}`);
  console.log(`Output written to: ${OUTPUT_RULES}`);
  console.log(`========================================\n`);
}

compileAllInteractions();
