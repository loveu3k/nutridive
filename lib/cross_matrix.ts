// Clinical Cross-Interaction Matrix (DDI, DNI, NNI, DFI) & Multi-Agent Synergy Engine
// Formulated from Krause and Mahan's Food & Nutrition Care Process, Modern Nutrition in Health and Disease, and NIH ODS

export interface CrossInteraction {
  substanceA: string;
  substanceB: string;
  type: 'DRUG_DRUG' | 'DRUG_NUTRIENT' | 'DRUG_FOOD' | 'NUTRIENT_NUTRIENT';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  mechanism: string;
  actionableAdvice: string;
}

export interface SynergyAlert {
  category: 'BLEEDING_RISK' | 'HYPERKALEMIA' | 'SEROTONIN_SYNDROME' | 'CNS_DEPRESSION' | 'QT_PROLONGATION';
  title: string;
  severity: 'CRITICAL' | 'HIGH';
  contributingSubstances: string[];
  clinicalWarning: string;
  actionableGuidance: string;
}

// 1. Pairwise Cross-Interaction Rules
interface PairRule {
  matchA: (classId: string, name: string) => boolean;
  matchB: (classId: string, name: string) => boolean;
  type: CrossInteraction['type'];
  severity: CrossInteraction['severity'];
  mechanism: string;
  actionableAdvice: string;
}

const PAIR_RULES: PairRule[] = [
  // --- DRUG ↔ DRUG (DDI) ---
  {
    matchA: (c) => c.includes('pde5') || c.includes('phosphodiesterase_5') || c === 'sildenafil' || c === 'tadalafil',
    matchB: (c, n) => c.includes('nitrate') || n.toLowerCase().includes('nitroglycerin') || n.toLowerCase().includes('isosorbide'),
    type: 'DRUG_DRUG',
    severity: 'CRITICAL',
    mechanism: 'Synergistic cGMP accumulation causes profound systemic vasodilation and life-threatening refractory hypotension.',
    actionableAdvice: 'Strictly contraindicated. Concomitant use is prohibited. Sildenafil must be separated by at least 24 hours, and Tadalafil by 48 hours, from nitrates.'
  },
  {
    matchA: (c) => c.includes('statin'),
    matchB: (c, n) => c.includes('fibrate') || n.toLowerCase().includes('gemfibrozil') || n.toLowerCase().includes('fenofibrate'),
    type: 'DRUG_DRUG',
    severity: 'HIGH',
    mechanism: 'Gemfibrozil inhibits statin glucuronidation and OATP1B1 uptake, raising statin plasma levels and sharply elevating rhabdomyolysis risks.',
    actionableAdvice: 'Avoid gemfibrozil with statins (fenofibrate is preferred if combination is clinically mandatory). Monitor for unprovoked muscle pain or darkened urine.'
  },
  {
    matchA: (c) => c.includes('ace_inhibitor') || c.includes('angiotensin_receptor_blocker'),
    matchB: (c) => c.includes('spironolactone') || c.includes('potassium_sparing') || c.includes('eplerenone'),
    type: 'DRUG_DRUG',
    severity: 'HIGH',
    mechanism: 'Dual blockade of aldosterone and renin-angiotensin pathways causes additive renal potassium retention.',
    actionableAdvice: 'Requires strict serum potassium and creatinine monitoring. Avoid dietary potassium supplements or potassium salt substitutes.'
  },
  {
    matchA: (c) => c.includes('nsaid') || c.includes('ibuprofen') || c.includes('naproxen'),
    matchB: (c, n) => n.toLowerCase().includes('aspirin') && !n.toLowerCase().includes('dipyridamole'),
    type: 'DRUG_DRUG',
    severity: 'HIGH',
    mechanism: 'NSAIDs (like Ibuprofen) competitively block the COX-1 binding channel, preventing irreversible aspirin acetylation and abolishing aspirin’s cardioprotective antiplatelet effect.',
    actionableAdvice: 'Take low-dose immediate-release aspirin at least 30 to 60 minutes before taking ibuprofen, or at least 8 hours after.'
  },

  // --- DRUG ↔ NUTRIENT / SUPPLEMENT (DNI) ---
  {
    matchA: (c) => c.includes('fluoroquinolone') || c.includes('tetracycline') || c.includes('penicillin') || c.includes('antibiotic'),
    matchB: (c) => c === 'supp_probiotics',
    type: 'DRUG_NUTRIENT',
    severity: 'HIGH',
    mechanism: 'Concomitant oral antibiotics kill viable probiotic strains in the stomach and small intestine, neutralizing the supplement before colonization.',
    actionableAdvice: 'Separate probiotic administration by at least 2 to 3 hours after the antibiotic dose. Continue probiotics for 10-14 days after finishing antibiotics.'
  },
  {
    matchA: (c) => c === 'warfarin',
    matchB: (c) => c === 'supp_omega3' || c === 'herb_curcumin_piperine' || c.includes('ginkgo') || c.includes('garlic'),
    type: 'DRUG_NUTRIENT',
    severity: 'HIGH',
    mechanism: 'Additive platelet inhibition combined with vitamin K antagonist therapy increases spontaneous mucosal, GI, and hematoma bleeding risks.',
    actionableAdvice: 'Limit Omega-3 fish oil to under 2-3 g/day. Maintain consistent intake and monitor PT/INR closely when introducing turmeric/curcumin or ginkgo supplements.'
  },
  {
    matchA: (c) => c === 'levothyroxine',
    matchB: (c) => c === 'mineral_calcium' || c === 'mineral_iron',
    type: 'DRUG_NUTRIENT',
    severity: 'HIGH',
    mechanism: 'Insoluble chelation complexes form in the GI tract, reducing levothyroxine bioavailability by up to 40% and worsening hypothyroid control.',
    actionableAdvice: 'Take levothyroxine on an empty stomach upon waking. Separate calcium and iron supplements by at least 4 hours.'
  },
  {
    matchA: (c) => c.includes('fluoroquinolones') || c.includes('tetracyclines'),
    matchB: (c) => c === 'mineral_calcium' || c === 'mineral_iron' || c === 'mineral_zinc' || c === 'mineral_magnesium',
    type: 'DRUG_NUTRIENT',
    severity: 'CRITICAL',
    mechanism: 'Polyvalent metal cations form insoluble chelate rings with antibiotic molecules, dropping absorption by 60% to 90% and risking bacterial therapy failure.',
    actionableAdvice: 'Administer mineral supplements at least 2 hours before or 4 to 6 hours after your antibiotic dose.'
  },
  {
    matchA: (c, n) => c.includes('levodopa') || n.toLowerCase().includes('sinemet') || n.toLowerCase().includes('carbidopa'),
    matchB: (c) => c === 'mineral_iron',
    type: 'DRUG_NUTRIENT',
    severity: 'HIGH',
    mechanism: 'Ferrous iron chelates levodopa in the gastrointestinal lumen, reducing peak plasma levodopa by over 50% and triggering clinical motor freezing in Parkinson patients.',
    actionableAdvice: 'Separate oral iron supplements from levodopa doses by at least 2 hours.'
  },
  {
    matchA: (c, n) => c.includes('bisphosphonate') || n.toLowerCase().includes('alendronate') || n.toLowerCase().includes('fosamax'),
    matchB: (c) => c === 'mineral_magnesium' || c === 'mineral_calcium',
    type: 'DRUG_NUTRIENT',
    severity: 'HIGH',
    mechanism: 'Magnesium and calcium cations form non-absorbable complexes with bisphosphonates in the stomach, virtually abolishing their already low bioavailability.',
    actionableAdvice: 'Take bisphosphonates with plain water upon waking; separate magnesium or calcium supplements by at least 2 hours.'
  },
  {
    matchA: (c, n) => c.includes('dolutegravir') || n.toLowerCase().includes('tivicay') || n.toLowerCase().includes('triumeq'),
    matchB: (c) => c === 'mineral_calcium' || c === 'mineral_iron',
    type: 'DRUG_NUTRIENT',
    severity: 'HIGH',
    mechanism: 'Polyvalent metal binding with dolutegravir substantially decreases antiretroviral plasma concentrations, risking viral breakthrough.',
    actionableAdvice: 'Take dolutegravir at least 2 hours before or 6 hours after taking calcium or iron supplements.'
  },
  {
    matchA: (c) => c === 'warfarin',
    matchB: (c, n) => c.includes('coenzyme_q10') || c.includes('coq10') || n.toLowerCase().includes('ubiquinone'),
    type: 'DRUG_NUTRIENT',
    severity: 'HIGH',
    mechanism: 'Coenzyme Q10 is structurally homologous to menaquinone (vitamin K2) and competitively counteracts warfarin, dropping INR and prothrombin time.',
    actionableAdvice: 'Monitor INR frequently when initiating, adjusting, or discontinuing CoQ10 supplements during warfarin therapy.'
  },
  {
    matchA: (c) => c === 'levothyroxine',
    matchB: (c, n) => c.includes('ashwagandha') || n.toLowerCase().includes('ashwagandha'),
    type: 'DRUG_NUTRIENT',
    severity: 'MEDIUM',
    mechanism: 'Ashwagandha stimulates endogenous thyroid hormone production, producing additive hyperthyroid symptoms (tachycardia, tremors, anxiety) when combined with levothyroxine.',
    actionableAdvice: 'Monitor serum TSH and free T4 levels if introducing ashwagandha alongside prescription thyroid replacement therapy.'
  },

  // --- NUTRIENT ↔ NUTRIENT (NNI) ---
  {
    matchA: (c) => c === 'mineral_zinc',
    matchB: (c) => c === 'mineral_copper',
    type: 'NUTRIENT_NUTRIENT',
    severity: 'HIGH',
    mechanism: 'High-dose zinc (>50 mg/day) strongly stimulates enterocyte metallothionein synthesis, which binds copper with high affinity and blocks its systemic absorption.',
    actionableAdvice: 'Ensure an optimal dietary zinc-to-copper ratio of 10:1 to 15:1. When taking >30 mg zinc daily, supplement 1 to 2 mg copper (taken at a different time of day).'
  },
  {
    matchA: (c) => c === 'mineral_calcium',
    matchB: (c) => c === 'mineral_iron' || c === 'mineral_zinc',
    type: 'NUTRIENT_NUTRIENT',
    severity: 'MEDIUM',
    mechanism: 'Calcium competes for enterocyte Divalent Metal Transporter 1 (DMT-1), significantly attenuating non-heme iron and zinc absorption.',
    actionableAdvice: 'Take calcium supplements with meals, but separate from iron and zinc supplements by at least 2 to 3 hours.'
  },
  {
    matchA: (c) => c === 'vitamin_c',
    matchB: (c) => c === 'mineral_iron',
    type: 'NUTRIENT_NUTRIENT',
    severity: 'MEDIUM',
    mechanism: 'Ascorbic acid reduces insoluble ferric iron (Fe3+) to soluble ferrous iron (Fe2+) in the duodenum, substantially improving iron absorption.',
    actionableAdvice: 'Clinically synergistic: Co-administering 100-200 mg Vitamin C with oral iron significantly boosts therapeutic hematological recovery.'
  },

  // --- DRUG ↔ FOOD (DFI) ---
  {
    matchA: (c) => c === 'warfarin',
    matchB: (c) => c === 'food_spinach',
    type: 'DRUG_FOOD',
    severity: 'CRITICAL',
    mechanism: 'High phylloquinone (Vitamin K1) directly overcomes coumarin anticoagulation, precipitating acute thromboembolism or ischemic stroke.',
    actionableAdvice: 'Do not drastically increase or vary leafy green intake. Keep day-to-day spinach consumption consistent and regularly monitor INR levels.'
  },
  {
    matchA: (c) => c.includes('ace_inhibitor') || c.includes('angiotensin_receptor_blocker') || c.includes('spironolactone'),
    matchB: (c) => c === 'food_salt_substitutes',
    type: 'DRUG_FOOD',
    severity: 'CRITICAL',
    mechanism: 'Exogenous potassium chloride salt substitutes overwhelm impaired renal potassium excretion, inducing acute hyperkalemic cardiac arrest.',
    actionableAdvice: 'Strictly avoid potassium-based table salts (NoSalt, Nu-Salt, Morton Salt Substitute) while taking ACE inhibitors, ARBs, or Spironolactone.'
  },
  {
    matchA: (c) => c.includes('fluoroquinolones') || c.includes('tetracyclines'),
    matchB: (c) => c === 'food_milk_dairy',
    type: 'DRUG_FOOD',
    severity: 'HIGH',
    mechanism: 'Ionic calcium and casein in milk chelate antibiotics, dropping oral bioavailability below the minimum inhibitory concentration (MIC).',
    actionableAdvice: 'Avoid milk, yogurt, and dairy products for 2 hours before and 4 hours after taking antibiotic tablets.'
  },
  {
    matchA: (c) => c.includes('statin') || c.includes('ccb_antihypertensive') || c.includes('phosphodiesterase_5'),
    matchB: (c) => c === 'food_grapefruit',
    type: 'DRUG_FOOD',
    severity: 'CRITICAL',
    mechanism: 'Furanocoumarins irreversibly destroy intestinal CYP3A4 enzymes, causing toxic spikes in drug exposure for up to 72 hours.',
    actionableAdvice: 'Avoid all grapefruit, pomelo, and Seville orange products completely during pharmacotherapy.'
  },
  {
    matchA: (c) => c.includes('maoi') || c.includes('linezolid'),
    matchB: (c) => c === 'food_aged_cheese_cured_meats',
    type: 'DRUG_FOOD',
    severity: 'CRITICAL',
    mechanism: 'Dietary tyramine escapes degradation and floods systemic circulation, triggering lethal hypertensive crises and stroke.',
    actionableAdvice: 'Strict tyramine-free diet (no aged cheeses, dry sausages, draft beers, or fermented soy products) during therapy and for 14 days post-treatment.'
  },
  {
    matchA: (c) => c.includes('diuretic') || c.includes('antihypertensive'),
    matchB: (c) => c === 'food_natural_licorice',
    type: 'DRUG_FOOD',
    severity: 'CRITICAL',
    mechanism: 'Glycyrrhizin inhibits renal 11-beta-HSD2, causing apparent mineralocorticoid excess, severe potassium wasting, and refractory hypertension.',
    actionableAdvice: 'Avoid natural black licorice, licorice teas, and unpurified licorice extracts if treating hypertension or taking diuretics.'
  },
  {
    matchA: (c) => c === 'fexofenadine' || c.includes('beta_blocker'),
    matchB: (c) => c === 'food_greentea_blacktea' || c === 'food_orange_apple_juice',
    type: 'DRUG_FOOD',
    severity: 'HIGH',
    mechanism: 'Fruit juice bioflavonoids and tea catechins block intestinal OATP influx transport pumps, reducing drug absorption by 30-70%.',
    actionableAdvice: 'Take fexofenadine and beta-blockers with plain water only. Avoid drinking fruit juices or green tea within 4 hours of dosage.'
  }
];

// 2. Evaluator Functions
export function evaluateCrossInteractions(
  items: { classId: string; name: string }[]
): CrossInteraction[] {
  const interactions: CrossInteraction[] = [];
  const seenPairs = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];

      for (const rule of PAIR_RULES) {
        const matchForward = rule.matchA(a.classId, a.name) && rule.matchB(b.classId, b.name);
        const matchBackward = rule.matchA(b.classId, b.name) && rule.matchB(a.classId, a.name);

        if (matchForward || matchBackward) {
          const pairKey = [a.name, b.name, rule.mechanism.slice(0, 20)].sort().join('::');
          if (!seenPairs.has(pairKey)) {
            seenPairs.add(pairKey);
            interactions.push({
              substanceA: matchForward ? a.name : b.name,
              substanceB: matchForward ? b.name : a.name,
              type: rule.type,
              severity: rule.severity,
              mechanism: rule.mechanism,
              actionableAdvice: rule.actionableAdvice
            });
          }
        }
      }
    }
  }

  return interactions;
}

// 3. Multi-Agent Synergy Detector
export function detectSynergies(
  items: { classId: string; name: string }[]
): SynergyAlert[] {
  const alerts: SynergyAlert[] = [];

  // A. Cumulative Bleeding Risk
  const bleedingSubstances = items.filter(item => {
    const c = item.classId.toLowerCase();
    const n = item.name.toLowerCase();
    return (
      c === 'warfarin' ||
      c.includes('anticoagulant') ||
      c.includes('antiplatelet') ||
      c.includes('nsaid') ||
      n.includes('aspirin') ||
      n.includes('ibuprofen') ||
      n.includes('naproxen') ||
      n.includes('plavix') ||
      n.includes('eliquis') ||
      n.includes('xarelto') ||
      c === 'supp_omega3' ||
      c === 'herb_curcumin_piperine' ||
      n.includes('fish oil') ||
      n.includes('ginkgo') ||
      n.includes('garlic')
    );
  });

  if (bleedingSubstances.length >= 2) {
    alerts.push({
      category: 'BLEEDING_RISK',
      title: 'Cumulative Antiplatelet & Anticoagulant Bleeding Synergy',
      severity: 'CRITICAL',
      contributingSubstances: bleedingSubstances.map(s => s.name),
      clinicalWarning: 'Multiple co-administered agents possess concurrent platelet-inhibiting, cyclooxygenase-suppressing, or anticoagulant actions. The combined effect exponentially multiplies the hazard of spontaneous gastrointestinal hemorrhage, epistaxis, or intracranial bleeding.',
      actionableGuidance: 'Discuss with your physician. Watch for unprovoked bruising, black tarry stools, pink/red urine, or prolonged bleeding from minor cuts.'
    });
  }

  // B. Cumulative Hyperkalemia Risk
  const hyperkalemiaSubstances = items.filter(item => {
    const c = item.classId.toLowerCase();
    const n = item.name.toLowerCase();
    return (
      c.includes('ace_inhibitor') ||
      c.includes('angiotensin_receptor_blocker') ||
      c.includes('spironolactone') ||
      c.includes('potassium_sparing') ||
      c === 'food_salt_substitutes' ||
      n.includes('potassium') ||
      n.includes('salt substitute')
    );
  });

  if (hyperkalemiaSubstances.length >= 2) {
    alerts.push({
      category: 'HYPERKALEMIA',
      title: 'Compounded Hyperkalemia Hazard (Potassium Retention)',
      severity: 'CRITICAL',
      contributingSubstances: hyperkalemiaSubstances.map(s => s.name),
      clinicalWarning: 'Concomitant intake of medications that suppress aldosterone excretion alongside exogenous potassium salt substitutes or supplements risks sudden, severe hyperkalemia (>6.5 mEq/L), precipitating flaccid muscle weakness and fatal cardiac arrhythmias.',
      actionableGuidance: 'Strictly avoid potassium chloride salt substitutes (NoSalt). Obtain routine serum potassium and creatinine electrolyte blood panels.'
    });
  }

  // C. Serotonin Syndrome Synergy
  const serotonergicSubstances = items.filter(item => {
    const c = item.classId.toLowerCase();
    const n = item.name.toLowerCase();
    return (
      c.includes('ssri') ||
      c.includes('snri') ||
      c.includes('maoi') ||
      c === 'herb_st_johns_wort' ||
      n.includes('5-htp') ||
      n.includes('tryptophan') ||
      n.includes('tramadol') ||
      n.includes('triptan') ||
      n.includes('prozac') ||
      n.includes('zoloft')
    );
  });

  if (serotonergicSubstances.length >= 2) {
    alerts.push({
      category: 'SEROTONIN_SYNDROME',
      title: 'Serotonergic Excess (Serotonin Syndrome Warning)',
      severity: 'CRITICAL',
      contributingSubstances: serotonergicSubstances.map(s => s.name),
      clinicalWarning: 'Concurrent usage of multiple serotonergic agents can overstimulate central and peripheral 5-HT receptors, precipitating life-threatening Serotonin Syndrome characterized by hyperthermia, ocular clonus, tremors, and autonomic instability.',
      actionableGuidance: 'Seek immediate emergency medical care if you experience shivering, severe muscle twitching, rapid heart rate, confusion, or fever.'
    });
  }

  // D. Cumulative CNS & Respiratory Depression
  const cnsDepressantSubstances = items.filter(item => {
    const c = item.classId.toLowerCase();
    const n = item.name.toLowerCase();
    return (
      c.includes('sedative') ||
      c.includes('opioid') ||
      c.includes('benzodiazepine') ||
      c === 'food_alcohol_ethanol' ||
      c === 'supp_melatonin' ||
      n.includes('alcohol') ||
      n.includes('beer') ||
      n.includes('wine') ||
      n.includes('ambien') ||
      n.includes('xanax')
    );
  });

  if (cnsDepressantSubstances.length >= 2) {
    alerts.push({
      category: 'CNS_DEPRESSION',
      title: 'Additive Central Nervous System & Respiratory Depression',
      severity: 'HIGH',
      contributingSubstances: cnsDepressantSubstances.map(s => s.name),
      clinicalWarning: 'Synergistic GABAergic and opioid receptor agonism sharply depresses respiratory drive, multiplying the risks of severe psychomotor impairment, hypoventilation, and accidental overdose.',
      actionableGuidance: 'Avoid operating motor vehicles or heavy machinery. Never combine prescription sedatives or opioids with alcohol.'
    });
  }

  return alerts;
}
