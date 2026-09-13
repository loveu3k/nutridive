import fs from 'fs';
import path from 'path';

const ALIASES_PATH = path.join(process.cwd(), 'data/aliases/drugs.json');
const RULES_PATH = path.join(process.cwd(), 'data/rules/interactions.json');
const ONTOLOGY_PATH = path.join(process.cwd(), 'data/rules/food_ontology.json');

// 1. Food & Nutrient Aliases to Inject into drugs.json
const NEW_ALIASES = [
  // Foods & Kitchen Items
  { keyword: 'grapefruit', classId: 'food_grapefruit', name: 'Grapefruit / Pomelo (Food)' },
  { keyword: 'pomelo', classId: 'food_grapefruit', name: 'Pomelo (Food)' },
  { keyword: 'grapefruit juice', classId: 'food_grapefruit', name: 'Grapefruit Juice (Beverage)' },
  { keyword: 'spinach', classId: 'food_spinach', name: 'Spinach / Swiss Chard (Greens)' },
  { keyword: 'swiss chard', classId: 'food_spinach', name: 'Swiss Chard (Greens)' },
  { keyword: 'rhubarb', classId: 'food_spinach', name: 'Rhubarb (High-Oxalate Food)' },
  { keyword: 'green tea', classId: 'food_greentea_blacktea', name: 'Green Tea / Matcha (Beverage)' },
  { keyword: 'matcha', classId: 'food_greentea_blacktea', name: 'Matcha (Beverage)' },
  { keyword: 'black tea', classId: 'food_greentea_blacktea', name: 'Black Tea (Beverage)' },
  { keyword: 'coffee', classId: 'food_coffee_caffeine', name: 'Coffee / Espresso (Beverage)' },
  { keyword: 'espresso', classId: 'food_coffee_caffeine', name: 'Espresso (Beverage)' },
  { keyword: 'salt substitute', classId: 'food_salt_substitutes', name: 'Potassium Salt Substitute (Seasoning)' },
  { keyword: 'potassium salt', classId: 'food_salt_substitutes', name: 'Potassium Chloride Salt Substitute' },
  { keyword: 'nosalt', classId: 'food_salt_substitutes', name: 'NoSalt / Nu-Salt (Potassium Substitute)' },
  { keyword: 'milk', classId: 'food_milk_dairy', name: 'Dairy Milk / Dairy Products' },
  { keyword: 'dairy', classId: 'food_milk_dairy', name: 'Dairy Products (Milk, Yogurt, Cheese)' },
  { keyword: 'yogurt', classId: 'food_milk_dairy', name: 'Yogurt (Dairy Product)' },
  { keyword: 'aged cheese', classId: 'food_aged_cheese_cured_meats', name: 'Aged Cheese (Tyramine-Rich)' },
  { keyword: 'cured meat', classId: 'food_aged_cheese_cured_meats', name: 'Cured Meats / Salami (Tyramine-Rich)' },
  { keyword: 'licorice', classId: 'food_natural_licorice', name: 'Natural Black Licorice (Glycyrrhizin)' },
  { keyword: 'black licorice', classId: 'food_natural_licorice', name: 'Black Licorice (Food)' },
  { keyword: 'orange juice', classId: 'food_orange_apple_juice', name: 'Orange Juice / Apple Juice' },
  { keyword: 'apple juice', classId: 'food_orange_apple_juice', name: 'Apple Juice (OATP Blocker)' },
  { keyword: 'alcohol', classId: 'food_alcohol_ethanol', name: 'Alcoholic Beverages (Beer, Wine, Spirits)' },
  { keyword: 'beer', classId: 'food_alcohol_ethanol', name: 'Beer (Alcoholic Beverage)' },
  { keyword: 'wine', classId: 'food_alcohol_ethanol', name: 'Wine (Alcoholic Beverage)' },

  // Key Dietary Supplements & Herbs
  { keyword: 'probiotics', classId: 'supp_probiotics', name: 'Probiotics (Live Cultures)' },
  { keyword: 'probiotic', classId: 'supp_probiotics', name: 'Probiotic Supplement' },
  { keyword: 'acidophilus', classId: 'supp_probiotics', name: 'Lactobacillus Acidophilus (Probiotic)' },
  { keyword: 'zinc', classId: 'mineral_zinc', name: 'Zinc Supplement (Gluconate/Picolinate)' },
  { keyword: 'zinc gluconate', classId: 'mineral_zinc', name: 'Zinc Gluconate' },
  { keyword: 'curcumin', classId: 'herb_curcumin_piperine', name: 'Curcumin / Turmeric Extract' },
  { keyword: 'turmeric', classId: 'herb_curcumin_piperine', name: 'Turmeric (Curcumin with Piperine)' },
  { keyword: 'piperine', classId: 'herb_curcumin_piperine', name: 'Piperine (Black Pepper Extract)' },
  { keyword: 'berberine', classId: 'herb_berberine', name: 'Berberine HCL (Alkaloid Supplement)' },
  { keyword: 'ashwagandha', classId: 'herb_ashwagandha', name: 'Ashwagandha (Withania somnifera)' },
  { keyword: 'st johns wort', classId: 'herb_st_johns_wort', name: "St. John's Wort (Hypericum perforatum)" },
  { keyword: "st. john's wort", classId: 'herb_st_johns_wort', name: "St. John's Wort Extract" },
  { keyword: 'cbd', classId: 'cannabidiol_cbd', name: 'Cannabidiol (CBD Oil / Gummies)' },
  { keyword: 'cannabidiol', classId: 'cannabidiol_cbd', name: 'Cannabidiol (CBD)' },
  { keyword: 'vitamin c', classId: 'vitamin_c', name: 'Vitamin C (Ascorbic Acid)' },
  { keyword: 'ascorbic acid', classId: 'vitamin_c', name: 'Ascorbic Acid (Vitamin C)' },
  { keyword: 'vitamin k2', classId: 'vitamin_k2', name: 'Vitamin K2 (Menaquinone MK-7)' },
  { keyword: 'magnesium', classId: 'mineral_magnesium', name: 'Magnesium (Glycinate / Citrate)' },
  { keyword: 'magnesium glycinate', classId: 'mineral_magnesium', name: 'Magnesium Glycinate' },
  { keyword: 'copper', classId: 'mineral_copper', name: 'Copper Supplement (Chelate)' },
  { keyword: 'melatonin', classId: 'supp_melatonin', name: 'Melatonin (Sleep Aid)' }
];

// 2. Comprehensive Clinical Interaction Rules for Injected Entities
const NEW_RULES = [
  {
    classId: 'supp_probiotics',
    displayName: 'Probiotics (Live Beneficial Bacteria)',
    recommendedSlot: 'morning',
    redFlags: [
      {
        item: 'Hot Beverages / Boiling Liquids (>40°C / 104°F)',
        reason: 'Heat denatures bacterial cell membranes and destroys viable cultures before reaching the colon.',
        severity: 'HIGH'
      }
    ],
    timingRules: [
      {
        conflictingWith: 'Oral Antibiotics (Amoxicillin, Ciprofloxacin, Doxycycline, etc.)',
        rule: 'Concomitant oral antibiotics eradicate viable probiotic bacteria in the stomach and gut lumen. Take probiotics at least 2 to 3 hours after your antibiotic dose.'
      }
    ],
    depletions: []
  },
  {
    classId: 'mineral_zinc',
    displayName: 'Zinc Supplement (Gluconate / Picolinate / Sulfate)',
    recommendedSlot: 'afternoon',
    redFlags: [],
    timingRules: [
      {
        conflictingWith: 'Calcium, Iron & Magnesium Supplements',
        rule: 'Competes directly for Divalent Metal Transporter 1 (DMT-1) absorption pathways in the enterocyte. Separate from calcium and iron supplements by 2 to 3 hours.'
      },
      {
        conflictingWith: 'Fluoroquinolones & Tetracyclines',
        rule: 'Forms insoluble gastrointestinal chelates with antibiotics. Administer zinc at least 2 hours before or 4 hours after antibiotic doses.'
      }
    ],
    depletions: [
      {
        nutrient: 'Copper (Cu)',
        advice: 'Chronic intake of high-dose zinc (>50 mg/day) strongly induces intestinal metallothionein, which irreversibly traps dietary copper and causes profound secondary copper deficiency, microcytic anemia, and irreversible peripheral neuropathy. Co-supplement 1-2 mg copper.'
      }
    ]
  },
  {
    classId: 'herb_curcumin_piperine',
    displayName: 'Curcumin & Turmeric Extract (often with Piperine)',
    recommendedSlot: 'afternoon',
    redFlags: [
      {
        item: 'Prescription Anticoagulants (Warfarin, Eliquis, Plavix, Aspirin)',
        reason: 'Possesses natural antiplatelet and antithrombotic properties. Concurrent use with prescription blood thinners multiplies spontaneous bleeding risks.',
        severity: 'HIGH'
      },
      {
        item: 'Prescription Drugs Dependent on CYP3A4 & P-Glycoprotein',
        reason: 'Most commercial curcumin extracts add Piperine (Black Pepper Extract) to boost bioavailability by 2000%. Piperine potently inhibits intestinal P-gp and hepatic CYP3A4, causing unexpected and dangerous blood concentration spikes of co-administered prescription drugs.',
        severity: 'HIGH'
      }
    ],
    timingRules: [
      {
        conflictingWith: 'Empty Stomach Intake',
        rule: 'Curcumin is highly lipophilic (fat-soluble). Must take with a meal containing at least 10-15 grams of healthy dietary fat (eggs, avocado, olive oil) for effective lymphatic absorption.'
      }
    ],
    depletions: []
  },
  {
    classId: 'herb_berberine',
    displayName: 'Berberine HCl (Plant Alkaloid)',
    recommendedSlot: 'afternoon',
    redFlags: [
      {
        item: 'Statins, Calcium Channel Blockers, Metformin & Immunosuppressants',
        reason: 'Berberine is a potent multi-target inhibitor of CYP3A4, CYP2D6, and P-glycoprotein. It can significantly elevate serum levels of statins, raising myopathy and hepatotoxicity risks.',
        severity: 'HIGH'
      }
    ],
    timingRules: [
      {
        conflictingWith: 'Empty Stomach Intake',
        rule: 'Take with or immediately after a meal to mitigate gastrointestinal cramping/diarrhea and maximize its insulin-sensitizing glucose disposal effects.'
      }
    ],
    depletions: []
  },
  {
    classId: 'herb_st_johns_wort',
    displayName: "St. John's Wort (Hypericum perforatum)",
    recommendedSlot: 'morning',
    redFlags: [
      {
        item: 'Oral Contraceptives (Birth Control Pills / Implants)',
        reason: 'Hyperforin potently induces hepatic CYP3A4 and intestinal P-gp, dramatically accelerating estrogen and progestin breakdown and causing contraceptive failure and unplanned pregnancies.',
        severity: 'CRITICAL'
      },
      {
        item: 'Prescription Antidepressants (SSRIs, SNRIs) & 5-HTP',
        reason: 'Additive inhibition of serotonin reuptake precipitates life-threatening Serotonin Syndrome (hyperthermia, autonomic rigidity, delirium, seizures).',
        severity: 'CRITICAL'
      },
      {
        item: 'Immunosuppressants (Cyclosporine, Tacrolimus) & Anticoagulants',
        reason: 'Accelerated drug clearance drops serum drug levels below therapeutic range, triggering acute organ transplant rejection or fatal stroke/thromboembolism.',
        severity: 'CRITICAL'
      }
    ],
    timingRules: [],
    depletions: []
  },
  {
    classId: 'cannabidiol_cbd',
    displayName: 'Cannabidiol (CBD Oil, Gummies, Tinctures)',
    recommendedSlot: 'evening',
    redFlags: [
      {
        item: 'Anticoagulants (Warfarin), Antiepileptics & Sedatives',
        reason: 'CBD is a competitive inhibitor of CYP2C19 and CYP3A4. It significantly impairs the metabolic clearance of warfarin and antiepileptic medications, precipitating severe bleeding or excessive central nervous system depression.',
        severity: 'HIGH'
      }
    ],
    timingRules: [],
    depletions: []
  },
  {
    classId: 'food_salt_substitutes',
    displayName: 'Potassium Salt Substitutes (KCl Seasonings)',
    recommendedSlot: 'morning',
    redFlags: [
      {
        item: 'ACE Inhibitors, ARBs & Potassium-Sparing Diuretics (Spironolactone)',
        reason: 'Low-sodium table salts contain concentrated potassium chloride. When combined with drugs that block renal aldosterone excretion, acute lethal hyperkalemia (>6.5 mEq/L) and sudden cardiac arrest can occur.',
        severity: 'CRITICAL'
      }
    ],
    timingRules: [],
    depletions: []
  },
  {
    classId: 'food_grapefruit',
    displayName: 'Grapefruit, Pomelo & Seville Oranges (Furanocoumarins)',
    recommendedSlot: 'morning',
    redFlags: [
      {
        item: 'Statins, Calcium Channel Blockers, Immunosuppressants & PDE5 Inhibitors',
        reason: 'Furanocoumarins irreversibly destroy enterocyte CYP3A4 enzymes for up to 72 hours, elevating systemic drug bioavailability into toxic ranges.',
        severity: 'CRITICAL'
      }
    ],
    timingRules: [],
    depletions: []
  },
  {
    classId: 'food_spinach',
    displayName: 'Spinach, Swiss Chard & High-Oxalate Leafy Greens',
    recommendedSlot: 'afternoon',
    redFlags: [
      {
        item: 'Vitamin K Antagonist (Warfarin / Coumadin)',
        reason: 'High dietary vitamin K1 directly reactivates hepatic clotting factor synthesis, nullifying warfarin and causing acute thrombosis and stroke.',
        severity: 'CRITICAL'
      }
    ],
    timingRules: [
      {
        conflictingWith: 'Calcium & Iron Supplements',
        rule: 'High oxalic acid content binds free calcium and non-heme iron into insoluble oxalates, preventing gastrointestinal absorption. Separate intake by at least 2 hours.'
      }
    ],
    depletions: []
  },
  {
    classId: 'food_greentea_blacktea',
    displayName: 'Green Tea, Black Tea & Matcha (Tannins & Catechins)',
    recommendedSlot: 'morning',
    redFlags: [],
    timingRules: [
      {
        conflictingWith: 'Oral Iron Supplements',
        rule: 'Polyphenolic tannins precipitate non-heme iron into insoluble complexes, dropping absorption by 60-80%. Avoid drinking tea within 2 hours of iron doses.'
      },
      {
        conflictingWith: 'Fexofenadine (Allegra) & Atenolol',
        rule: 'Catechins (EGCG) block intestinal OATP1A2 and OATP2B1 influx transport pumps, drastically reducing allergy and beta-blocker drug absorption. Avoid green tea within 4 hours.'
      }
    ],
    depletions: []
  },
  {
    classId: 'food_natural_licorice',
    displayName: 'Natural Black Licorice & Licorice Root (Glycyrrhizin)',
    recommendedSlot: 'afternoon',
    redFlags: [
      {
        item: 'Blood Pressure Medications & Diuretics (Furosemide, HCTZ)',
        reason: 'Glycyrrhizin inhibits renal 11-beta-HSD2, inducing pseudoaldosteronism with marked sodium retention, potassium wasting, and severe rebound hypertension.',
        severity: 'CRITICAL'
      }
    ],
    timingRules: [],
    depletions: []
  },
  {
    classId: 'food_orange_apple_juice',
    displayName: 'Orange Juice & Apple Juice (Flavonoids)',
    recommendedSlot: 'morning',
    redFlags: [],
    timingRules: [
      {
        conflictingWith: 'Fexofenadine (Allegra) & Atenolol (Tenormin)',
        rule: 'Hesperidin and naringin bioflavonoids inhibit enterocyte OATP influx transporters, cutting oral drug absorption by up to 70%. Take medication with plain water only; separate fruit juices by 4 hours.'
      }
    ],
    depletions: []
  },
  {
    classId: 'food_aged_cheese_cured_meats',
    displayName: 'Aged Cheese, Cured Meats & Fermented Foods (High-Tyramine)',
    recommendedSlot: 'afternoon',
    redFlags: [
      {
        item: 'Monoamine Oxidase Inhibitors (MAOIs - Nardil, Parnate, Linezolid)',
        reason: 'Dietary tyramine escapes degradation, flooding systemic circulation and displacing catecholamines to trigger fatal hypertensive crises, stroke, and intracranial hemorrhage.',
        severity: 'CRITICAL'
      }
    ],
    timingRules: [],
    depletions: []
  },
  {
    classId: 'vitamin_d3',
    displayName: 'Vitamin D3 (Cholecalciferol)',
    recommendedSlot: 'morning',
    redFlags: [],
    timingRules: [
      {
        conflictingWith: 'Fasting / Zero-Fat Meals',
        rule: 'Lipophilic absorption requirement: Vitamin D3 is fat-soluble. Absorption increases by up to 50% when co-ingested with a meal containing healthy dietary fats.'
      }
    ],
    depletions: []
  },
  {
    classId: 'vitamin_c',
    displayName: 'Vitamin C (Ascorbic Acid)',
    recommendedSlot: 'morning',
    redFlags: [],
    timingRules: [
      {
        conflictingWith: 'Non-Heme Iron Supplements (Positive Synergy)',
        rule: 'Ascorbic acid reduces insoluble ferric iron (Fe3+) to soluble ferrous iron (Fe2+) in the duodenum, substantially improving iron absorption. Taking together is clinically synergistic.'
      }
    ],
    depletions: []
  },
  {
    classId: 'mineral_magnesium',
    displayName: 'Magnesium (Glycinate / Citrate / Oxide)',
    recommendedSlot: 'evening',
    redFlags: [],
    timingRules: [
      {
        conflictingWith: 'Oral Bisphosphonates, Fluoroquinolones & Tetracyclines',
        rule: 'Magnesium cations bind and chelate active drugs. Administer at least 2 hours before or 4 hours after prescription antibiotics or osteoporosis medications.'
      }
    ],
    depletions: []
  }
];

function injectFoodAndNutrients() {
  console.log('Injecting Food and Nutrient Ontology into SafeStack...');

  // 1. Update Aliases
  let aliases = [];
  if (fs.existsSync(ALIASES_PATH)) {
    aliases = JSON.parse(fs.readFileSync(ALIASES_PATH, 'utf-8'));
  }

  const aliasMap = new Map();
  aliases.forEach(a => aliasMap.set(a.keyword.toLowerCase().trim(), a));

  let addedAliases = 0;
  for (const na of NEW_ALIASES) {
    const key = na.keyword.toLowerCase().trim();
    if (!aliasMap.has(key)) {
      aliasMap.set(key, na);
      addedAliases++;
    } else {
      // Update with refined name / classId
      aliasMap.set(key, na);
    }
  }

  const updatedAliases = Array.from(aliasMap.values());
  fs.writeFileSync(ALIASES_PATH, JSON.stringify(updatedAliases, null, 2), 'utf-8');
  console.log(`Updated drugs.json: Total aliases = ${updatedAliases.length} (added/updated ${addedAliases} foods & nutrients).`);

  // 2. Update Interactions Rules
  let rules = [];
  if (fs.existsSync(RULES_PATH)) {
    rules = JSON.parse(fs.readFileSync(RULES_PATH, 'utf-8'));
  }

  const ruleMap = new Map();
  rules.forEach(r => ruleMap.set(r.classId, r));

  let addedRules = 0;
  for (const nr of NEW_RULES) {
    if (!ruleMap.has(nr.classId)) {
      ruleMap.set(nr.classId, nr);
      addedRules++;
    } else {
      // Merge or update with detailed clinical guidelines
      const existing = ruleMap.get(nr.classId);
      existing.displayName = nr.displayName || existing.displayName;
      existing.recommendedSlot = nr.recommendedSlot || existing.recommendedSlot;
      
      // Merge unique redFlags
      nr.redFlags.forEach(nrf => {
        if (!existing.redFlags.some(erf => erf.item === nrf.item)) {
          existing.redFlags.push(nrf);
        }
      });
      // Merge unique timingRules
      nr.timingRules.forEach(ntr => {
        if (!existing.timingRules.some(etr => etr.conflictingWith === ntr.conflictingWith)) {
          existing.timingRules.push(ntr);
        }
      });
      // Merge unique depletions
      nr.depletions.forEach(nd => {
        if (!existing.depletions.some(ed => ed.nutrient === nd.nutrient)) {
          existing.depletions.push(nd);
        }
      });
      addedRules++;
    }
  }

  const updatedRules = Array.from(ruleMap.values());
  fs.writeFileSync(RULES_PATH, JSON.stringify(updatedRules, null, 2), 'utf-8');
  console.log(`Updated interactions.json: Total rules = ${updatedRules.length} (enriched ${addedRules} food & supplement rules).`);

  console.log('Phase 2 Food & Nutrient Injection Complete!');
}

injectFoodAndNutrients();
