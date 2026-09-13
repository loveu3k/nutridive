import fs from 'fs';
import path from 'path';

export interface FoodConflict {
  foodName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  bioactiveCompound: string;
  biochemicalTarget: string;
  mechanism: string;
  clinicalGuidance: string;
  source: string;
}

export interface DrugConflict {
  drugOrClass: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  mechanism: string;
  clinicalConsequence: string;
  actionableAdvice: string;
  source: string;
}

export interface SupplementConflict {
  supplementName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  biochemicalTarget: string;
  clinicalExplanation: string;
  actionableAdvice: string;
  source: string;
}

export interface DepletionProtocol {
  nutrient: string;
  pathwayMechanism: string;
  recommendedSupport: string;
  evidenceSource: string;
}

export interface TimingProtocol {
  title: string;
  instruction: string;
  rationale: string;
  badge: 'MEAL' | 'EMPTY_STOMACH' | 'MORNING' | 'EVENING' | 'SPACING';
}

export interface RelatedPair {
  slug: string;
  title: string;
  substanceA: string;
  substanceB: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface DrugDossier {
  drugName: string;
  genericName: string;
  slug: string;
  medlineSlug: string;
  sourceUrl: string;
  brandNames: string[];
  pharmacologicalClass: string;
  clinicalSummary: string;
  specialDietaryInstructions: string | null;
  hasSpecialDiet: boolean;
  foodPrecautions: string[];
  timingGuidance: string[];
  
  foodConflicts: FoodConflict[];
  drugConflicts: DrugConflict[];
  supplementConflicts: SupplementConflict[];
  depletions: DepletionProtocol[];
  timingProtocols: TimingProtocol[];
  relatedPairs: RelatedPair[];
}

interface RawDrugEntry {
  drugName: string;
  genericName: string;
  slug: string;
  medlineSlug: string;
  sourceUrl: string;
  brandNames: string[];
  specialDietaryInstructions: string | null;
  hasSpecialDiet: boolean;
  foodPrecautions: string[];
  timingGuidance: string[];
}

let cachedDrugs: RawDrugEntry[] | null = null;
let cachedFoods: any[] | null = null;
let cachedInteractions: any[] | null = null;
let cachedPairs: any[] | null = null;
let cachedODS: any[] | null = null;
let cachedNCCIH: any[] | null = null;

function loadDatabases() {
  if (!cachedDrugs) {
    const cwd = process.cwd();
    const pDrugs = path.join(cwd, 'data/rules/medline_dietary_rules.json');
    const pFoods = path.join(cwd, 'data/rules/food_ontology.json');
    const pInteractions = path.join(cwd, 'data/rules/interactions.json');
    const pPairs = path.join(cwd, 'data/rules/interaction_pairs.json');
    const pODS = path.join(cwd, 'data/rules/ods_extracted_rules.json');
    const pNCCIH = path.join(cwd, 'data/rules/nccih_extracted_rules.json');

    cachedDrugs = fs.existsSync(pDrugs) ? JSON.parse(fs.readFileSync(pDrugs, 'utf-8')) : [];
    cachedFoods = fs.existsSync(pFoods) ? JSON.parse(fs.readFileSync(pFoods, 'utf-8')) : [];
    cachedInteractions = fs.existsSync(pInteractions) ? JSON.parse(fs.readFileSync(pInteractions, 'utf-8')) : [];
    cachedPairs = fs.existsSync(pPairs) ? JSON.parse(fs.readFileSync(pPairs, 'utf-8')) : [];
    cachedODS = fs.existsSync(pODS) ? JSON.parse(fs.readFileSync(pODS, 'utf-8')) : [];
    cachedNCCIH = fs.existsSync(pNCCIH) ? JSON.parse(fs.readFileSync(pNCCIH, 'utf-8')) : [];
  }
}

export function getAllDrugEntries(): RawDrugEntry[] {
  loadDatabases();
  return cachedDrugs || [];
}

export function getEnrichedDrugDossier(slug: string): DrugDossier | null {
  loadDatabases();
  const drugs = cachedDrugs || [];
  const drug = drugs.find(d => d.slug.toLowerCase() === slug.toLowerCase());
  if (!drug) return null;

  const foods = cachedFoods || [];
  const interactions = cachedInteractions || [];
  const pairs = cachedPairs || [];
  const ods = cachedODS || [];
  const nccih = cachedNCCIH || [];

  const genericLower = drug.genericName.toLowerCase();
  const drugNameLower = drug.drugName.toLowerCase();
  const brandList = (drug.brandNames || []).map(b => b.toLowerCase());
  
  const textCorpus = [
    drug.drugName,
    drug.genericName,
    ...brandList,
    drug.specialDietaryInstructions || '',
    ...(drug.foodPrecautions || []),
    ...(drug.timingGuidance || [])
  ].join(' ').toLowerCase();

  // 1. Identify Pharmacological Class & Profile
  let pharmacologicalClass = 'Prescription Therapeutic Agent';
  let clinicalSummary = `Comprehensive clinical interaction and dietary monograph for ${drug.drugName} (${drug.genericName}).`;

  if (genericLower.includes('aliskiren') || drugNameLower.includes('tekturna')) {
    pharmacologicalClass = 'Direct Renin Inhibitor (Antihypertensive)';
    clinicalSummary = 'Aliskiren directly blocks renin at the rate-limiting step of the renin-angiotensin-aldosterone system (RAAS), suppressing plasma renin activity and reducing angiotensin I/II production.';
  } else if (genericLower.includes('alfuzosin') || drugNameLower.includes('uroxatral')) {
    pharmacologicalClass = 'Selective Alpha-1 Adrenergic Receptor Antagonist';
    clinicalSummary = 'Alfuzosin selectively blocks postsynaptic alpha-1 adrenoreceptors in the prostate, bladder base, and prostatic capsule, relaxing smooth muscle without significant peripheral vascular syncope when taken properly with food.';
  } else if (genericLower.includes('warfarin') || drugNameLower.includes('coumadin') || drugNameLower.includes('jantoven')) {
    pharmacologicalClass = 'Vitamin K Antagonist (Anticoagulant)';
    clinicalSummary = 'Warfarin competitively inhibits the vitamin K epoxide reductase complex 1 (VKORC1), blocking hepatic carboxylation of clotting factors II, VII, IX, and X.';
  } else if (genericLower.includes('exenatide') || drugNameLower.includes('byetta') || drugNameLower.includes('bydureon')) {
    pharmacologicalClass = 'Glucagon-Like Peptide-1 (GLP-1) Receptor Agonist';
    clinicalSummary = 'Exenatide augments glucose-dependent insulin secretion, suppresses inappropriate glucagon secretion, and decelerates gastric motility, directly influencing oral drug transit times.';
  } else if (genericLower.includes('beclomethasone') || drugNameLower.includes('beconase') || drugNameLower.includes('qnasl')) {
    pharmacologicalClass = 'Synthetic Glucocorticoid / Corticosteroid';
    clinicalSummary = 'Beclomethasone exerts potent anti-inflammatory action by suppressing leukocyte extravasation, cytokine transcription, and mucosal edema.';
  } else if (genericLower.includes('statin') || ['atorvastatin', 'simvastatin', 'lovastatin', 'rosuvastatin', 'pravastatin'].some(s => genericLower.includes(s))) {
    pharmacologicalClass = 'HMG-CoA Reductase Inhibitor (Statin)';
    clinicalSummary = 'Statins competitively inhibit 3-hydroxy-3-methylglutaryl-coenzyme A reductase, the rate-limiting enzyme in hepatic cholesterol biosynthesis.';
  } else if (genericLower.includes('metformin') || drugNameLower.includes('glucophage')) {
    pharmacologicalClass = 'Biguanide (Antihyperglycemic Agent)';
    clinicalSummary = 'Metformin activates AMP-activated protein kinase (AMPK), decreasing hepatic gluconeogenesis and intestinal glucose absorption while improving peripheral insulin sensitivity.';
  } else if (genericLower.includes('levothyroxine') || drugNameLower.includes('synthroid')) {
    pharmacologicalClass = 'Synthetic Levothyroxine (T4 Replacement)';
    clinicalSummary = 'Levothyroxine replaces endogenous thyroid hormone (thyroxine), undergoing peripheral deiodination into active liothyronine (T3) to regulate cellular basal metabolic rates.';
  } else if (genericLower.includes('ciprofloxacin') || genericLower.includes('levofloxacin') || genericLower.includes('moxifloxacin')) {
    pharmacologicalClass = 'Fluoroquinolone Broad-Spectrum Antibacterial';
    clinicalSummary = 'Fluoroquinolones inhibit bacterial DNA gyrase (topoisomerase II) and topoisomerase IV, preventing bacterial DNA replication and transcription.';
  } else if (genericLower.includes('omeprazole') || genericLower.includes('pantoprazole') || genericLower.includes('esomeprazole')) {
    pharmacologicalClass = 'Proton Pump Inhibitor (Gastric Acid Suppressant)';
    clinicalSummary = 'PPIs bind covalently to the H+/K+-ATPase enzyme system at the secretory surface of gastric parietal cells, blocking basal and stimulated gastric acid production.';
  } else if (genericLower.includes('lisinopril') || genericLower.includes('enalapril') || genericLower.includes('ramipril')) {
    pharmacologicalClass = 'Angiotensin-Converting Enzyme (ACE) Inhibitor';
    clinicalSummary = 'ACE inhibitors suppress the conversion of angiotensin I to angiotensin II, decreasing systemic arteriolar resistance and reducing aldosterone secretion.';
  } else if (genericLower.includes('losartan') || genericLower.includes('valsartan') || genericLower.includes('candesartan')) {
    pharmacologicalClass = 'Angiotensin II Receptor Blocker (ARB)';
    clinicalSummary = 'ARBs selectively block the binding of angiotensin II to the AT1 receptor subtype, blunting vasoconstriction and aldosterone release without inhibiting bradykinin degradation.';
  } else if (genericLower.includes('sildenafil') || genericLower.includes('tadalafil')) {
    pharmacologicalClass = 'Phosphodiesterase Type 5 (PDE5) Inhibitor';
    clinicalSummary = 'PDE5 inhibitors enhance cellular cyclic GMP levels by inhibiting cGMP degradation in cavernosal smooth muscle and pulmonary vascular endothelium.';
  } else if (genericLower.includes('alendronate') || genericLower.includes('risedronate') || genericLower.includes('ibandronate')) {
    pharmacologicalClass = 'Amino-Bisphosphonate (Osteoclast Inhibitor)';
    clinicalSummary = 'Bisphosphonates bind with high affinity to hydroxyapatite crystals in bone surfaces, inhibiting farnesyl pyrophosphate synthase and inducing osteoclast apoptosis.';
  }

  // 2. Extract Food Conflicts
  const foodConflicts: FoodConflict[] = [];

  // Check matching from Food Ontology
  for (const food of foods) {
    const keywordMatch = food.keywords?.some((kw: string) => textCorpus.includes(kw.toLowerCase()));
    const classMatch = food.conflictingClasses?.some((c: string) => {
      if (c === 'warfarin' && genericLower.includes('warfarin')) return true;
      if (c === 'metformin' && genericLower.includes('metformin')) return true;
      if (c === 'fexofenadine' && genericLower.includes('fexofenadine')) return true;
      if (c === 'levothyroxine' && genericLower.includes('levothyroxine')) return true;
      if (c === 'statin_cyp3a4' && (genericLower.includes('atorvastatin') || genericLower.includes('simvastatin') || genericLower.includes('lovastatin'))) return true;
      if (c === 'ccb_antihypertensive' && (genericLower.includes('amlodipine') || genericLower.includes('nifedipine') || genericLower.includes('verapamil') || genericLower.includes('diltiazem'))) return true;
      if (c === 'ace_inhibitor' && (genericLower.includes('lisinopril') || genericLower.includes('enalapril') || genericLower.includes('ramipril'))) return true;
      if (c === 'angiotensin_receptor_blocker' && (genericLower.includes('losartan') || genericLower.includes('valsartan'))) return true;
      if (c === 'potassium_sparing_diuretics' && (genericLower.includes('spironolactone') || genericLower.includes('eplerenone'))) return true;
      if (c === 'fluoroquinolones' && (genericLower.includes('ciprofloxacin') || genericLower.includes('levofloxacin'))) return true;
      if (c === 'tetracyclines' && (genericLower.includes('doxycycline') || genericLower.includes('minocycline'))) return true;
      if (c === 'bisphosphonates' && (genericLower.includes('alendronate') || genericLower.includes('risedronate'))) return true;
      if (c === 'phosphodiesterase_5_inhibitor_epc' && (genericLower.includes('sildenafil') || genericLower.includes('tadalafil'))) return true;
      if (c === 'antiarrhythmic_agent' && (genericLower.includes('amiodarone') || genericLower.includes('digoxin'))) return true;
      return false;
    });

    if (keywordMatch || classMatch) {
      const bio = food.bioactiveCompounds?.[0] || {};
      foodConflicts.push({
        foodName: food.name,
        severity: food.foodId === 'food_grapefruit' || food.foodId === 'food_salt_substitutes' || food.foodId === 'food_spinach' ? 'CRITICAL' : 'HIGH',
        bioactiveCompound: bio.compound || 'Bioactive Food Constituent',
        biochemicalTarget: bio.target || 'Intestinal Transporters / Enzymes',
        mechanism: bio.clinicalDescription || 'Biochemical interaction impacting systemic absorption or pharmacodynamics.',
        clinicalGuidance: food.guidance || 'Follow official dietary separation and intake consistency guidelines.',
        source: 'NutriDive Kitchen Food Biochemical Ontology & openFDA'
      });
    }
  }

  // Specific rule for High-Fat Meals if mentioned or known
  if (textCorpus.includes('high fat') || textCorpus.includes('fatty meal') || genericLower.includes('aliskiren') || genericLower.includes('sildenafil')) {
    if (!foodConflicts.some(f => f.foodName.toLowerCase().includes('high-fat'))) {
      foodConflicts.push({
        foodName: 'High-Fat Meals, Greasy & Fried Foods',
        severity: 'HIGH',
        bioactiveCompound: 'Saturated Triglycerides & Lipid Emulsions',
        biochemicalTarget: 'Splanchnic Hemodynamics & Enterocyte Passive Diffusion',
        mechanism: 'High-fat meals substantially alter gastrointestinal transit time and micellar partitioning, decreasing peak systemic drug concentration (Cmax) by up to 71% (as seen with Aliskiren) or delaying onset.',
        clinicalGuidance: 'Avoid consuming meals high in fat when taking your dosage. Maintain consistent meal timing and nutritional composition.',
        source: 'U.S. FDA Clinical Pharmacology & SPL Section 7'
      });
    }
  }

  // Specific rule for Potassium Table Salts if mentioned
  if ((textCorpus.includes('salt substitute') || textCorpus.includes('potassium')) && !foodConflicts.some(f => f.foodName.toLowerCase().includes('salt substitute'))) {
    foodConflicts.push({
      foodName: 'Potassium-Enriched Salt Substitutes (NoSalt, Nu-Salt)',
      severity: 'CRITICAL',
      bioactiveCompound: 'Potassium Chloride (KCl)',
      biochemicalTarget: 'Renal Cortical Collecting Duct Electrophysiology',
      mechanism: 'Exogenous potassium chloride loads cannot be cleared efficiently when RAAS or renal filtration is modified, risking acute lethal hyperkalemia (>6.5 mEq/L) and ventricular arrhythmias.',
      clinicalGuidance: 'Strictly avoid low-sodium seasonings containing potassium chloride without explicit physician approval and laboratory electrolyte monitoring.',
      source: 'NLM MedlinePlus Dietary Warning & openFDA'
    });
  }

  // 3. Extract Prescription & OTC Medication Red Flags (DDI)
  const drugConflicts: DrugConflict[] = [];

  // Parse text precautions for NSAIDs / Aspirin
  if (textCorpus.includes('nsaid') || textCorpus.includes('ibuprofen') || textCorpus.includes('naproxen') || textCorpus.includes('aspirin')) {
    drugConflicts.push({
      drugOrClass: 'NSAIDs (Ibuprofen, Naproxen) & Non-Cardioprotective Analgesics',
      severity: 'HIGH',
      mechanism: 'Inhibition of renal vasodilatory prostaglandins (PGI2, PGE2) causes afferent arteriolar vasoconstriction, blunts blood pressure control, and increases risk of acute kidney injury (AKI).',
      clinicalConsequence: 'Loss of blood pressure reduction, fluid retention, or acute renal hemodynamic compromise.',
      actionableAdvice: 'Consult your physician before taking OTC pain relievers. Acetaminophen may be preferred for occasional pain depending on liver status.',
      source: 'openFDA SPL Section 7 (Drug Interactions)'
    });
  }

  // Parse ACE/ARB combinations or Potassium-sparing
  if (genericLower.includes('aliskiren') || genericLower.includes('lisinopril') || genericLower.includes('losartan')) {
    drugConflicts.push({
      drugOrClass: 'Dual RAAS Blockers (ACE Inhibitors, ARBs, Direct Renin Inhibitors)',
      severity: 'CRITICAL',
      mechanism: 'Additive suppression of the renin-angiotensin-aldosterone axis produces profound systemic hypotension, acute renal dysfunction, and hyperkalemia without added cardiovascular benefit.',
      clinicalConsequence: 'Severe hypotension, syncope, and hyperkalemic cardiac events.',
      actionableAdvice: 'Concomitant use of aliskiren with ARBs or ACE inhibitors is contraindicated in patients with diabetes or moderate-to-severe renal impairment.',
      source: 'FDA Drug Safety Communication & Black Box Warnings'
    });
  }

  // Alfuzosin specific DDI
  if (genericLower.includes('alfuzosin')) {
    drugConflicts.push({
      drugOrClass: 'Potent CYP3A4 Inhibitors (Ketoconazole, Itraconazole, Ritonavir)',
      severity: 'CRITICAL',
      mechanism: 'Alfuzosin is extensively metabolized by hepatic CYP3A4. Strong inhibitors cause dramatic elevations in plasma drug levels and area under the curve (AUC).',
      clinicalConsequence: 'Profound orthostatic hypotension, reflex tachycardia, dizziness, and collapse.',
      actionableAdvice: 'Concomitant administration with potent CYP3A4 inhibitors is contraindicated.',
      source: 'FDA Prescribing Information'
    });
    drugConflicts.push({
      drugOrClass: 'Phosphodiesterase-5 (PDE5) Inhibitors (Sildenafil, Tadalafil)',
      severity: 'HIGH',
      mechanism: 'Additive peripheral vasodilatory synergy across alpha-adrenergic blockade and cGMP accumulation pathways.',
      clinicalConsequence: 'Symptomatic hypotension and presyncope upon standing.',
      actionableAdvice: 'Patients must be clinically stable on alpha-blocker therapy before initiating a PDE5 inhibitor at the lowest effective dose.',
      source: 'openFDA Clinical Pharmacology'
    });
  }

  // Warfarin specific DDI
  if (genericLower.includes('warfarin')) {
    drugConflicts.push({
      drugOrClass: 'Antiplatelet Agents (Aspirin, Clopidogrel) & NSAIDs',
      severity: 'CRITICAL',
      mechanism: 'Dual impairment of primary platelet plug formation and secondary coagulation cascade carboxylation, combined with gastric mucosal ulceration.',
      clinicalConsequence: 'Severe spontaneous gastrointestinal hemorrhage, intracranial bleeding, or hematoma.',
      actionableAdvice: 'Avoid OTC NSAIDs and unprescribed aspirin. Any co-prescribed therapy requires intensive INR surveillance.',
      source: 'FDA SPL Section 7 Boxed Warning'
    });
    drugConflicts.push({
      drugOrClass: 'Broad-Spectrum Antibiotics & Azole Antifungals',
      severity: 'HIGH',
      mechanism: 'Antibiotics eradicate intestinal vitamin K-synthesizing flora; azoles (fluconazole) potently inhibit CYP2C9 clearance of S-warfarin.',
      clinicalConsequence: 'Rapid, unpredictable spike in INR and severe hypoprothrombinemia.',
      actionableAdvice: 'Notify anticoagulation clinic immediately upon starting or stopping any antibiotic or antifungal course for dose adjustment.',
      source: 'NLM MedlinePlus Drug Precautions'
    });
  }

  // Corticosteroid specific DDI
  if (genericLower.includes('beclomethasone') || genericLower.includes('prednisone') || genericLower.includes('fluticasone')) {
    drugConflicts.push({
      drugOrClass: 'Systemic NSAIDs (Ibuprofen, Naproxen, Meloxicam)',
      severity: 'HIGH',
      mechanism: 'Dual cyclooxygenase inhibition and corticosteroid-mediated gastric mucosal thinning synergistically accelerate peptic ulceration.',
      clinicalConsequence: 'Gastric erosions, silent gastrointestinal ulceration, and GI bleeding.',
      actionableAdvice: 'Use gastroprotective therapy (e.g., PPI) if co-administration is clinically mandatory.',
      source: 'FDA SPL Section 7'
    });
  }

  // GLP-1 specific DDI
  if (genericLower.includes('exenatide') || genericLower.includes('semaglutide') || genericLower.includes('liraglutide')) {
    drugConflicts.push({
      drugOrClass: 'Oral Contraceptives, Oral Antibiotics & Narrow-Therapeutic-Index Drugs',
      severity: 'HIGH',
      mechanism: 'Slowing of gastric emptying delays the arrival of oral drugs at the proximal small intestine where primary absorption occurs, reducing peak concentration (Cmax).',
      clinicalConsequence: 'Potential reduction in contraceptive efficacy or delayed antibiotic onset.',
      actionableAdvice: 'Take oral contraceptives and antibiotics at least 1 hour before injecting exenatide. If taken with food, take during a meal when exenatide is not administered.',
      source: 'FDA Clinical Pharmacology Guidance'
    });
    drugConflicts.push({
      drugOrClass: 'Insulin & Sulfonylureas (Glipizide, Glimepiride)',
      severity: 'HIGH',
      mechanism: 'Additive insulinotropic action substantially elevates the risk of acute neuroglycopenic hypoglycemia.',
      clinicalConsequence: 'Severe hypoglycemia, diaphoresis, tremors, confusion, or loss of consciousness.',
      actionableAdvice: 'A pre-emptive dose reduction of secretagogues or insulin is frequently warranted when initiating GLP-1 therapy.',
      source: 'American Diabetes Association (ADA) Clinical Guidelines'
    });
  }

  // 4. Extract Dietary Supplements, Herbs & Minerals (DNI)
  const supplementConflicts: SupplementConflict[] = [];

  // Potassium supplements
  if (textCorpus.includes('potassium supplement') || genericLower.includes('aliskiren') || genericLower.includes('lisinopril') || genericLower.includes('losartan')) {
    supplementConflicts.push({
      supplementName: 'Potassium Supplements (Potassium Chloride, Gluconate, Citrate)',
      severity: 'CRITICAL',
      biochemicalTarget: 'Myocardial Resting Membrane Potential & Cardiac Conduction',
      clinicalExplanation: 'Direct renin inhibition suppresses downstream aldosterone secretion, preventing physiological urinary potassium excretion. Exogenous potassium supplements directly provoke dangerous serum hyperkalemia.',
      actionableAdvice: 'Do not take oral potassium supplements unless specifically prescribed and monitored by your physician.',
      source: 'NIH Office of Dietary Supplements (ODS) & NLM MedlinePlus'
    });
  }

  // St. John's Wort
  if (textCorpus.includes('st. john') || genericLower.includes('warfarin') || genericLower.includes('alfuzosin') || genericLower.includes('statin') || genericLower.includes('cyclosporine')) {
    supplementConflicts.push({
      supplementName: "St. John's Wort (Hypericum perforatum)",
      severity: 'HIGH',
      biochemicalTarget: 'Hepatic Cytochrome P450 3A4 / 2C9 & P-glycoprotein (P-gp)',
      clinicalExplanation: 'Hyperforin potently activates the Pregnane X Receptor (PXR), inducing hepatic CYP enzymes and intestinal P-gp pumps. This accelerates medication clearance and precipitates therapeutic failure.',
      actionableAdvice: 'Completely avoid herbal St. John\'s Wort while taking prescription medications.',
      source: 'NIH National Center for Complementary and Integrative Health (NCCIH)'
    });
  }

  // Ginkgo Biloba / Garlic / Curcumin
  if (textCorpus.includes('ginkgo') || textCorpus.includes('garlic') || genericLower.includes('warfarin')) {
    supplementConflicts.push({
      supplementName: 'Ginkgo Biloba & High-Dose Garlic Extracts',
      severity: 'HIGH',
      biochemicalTarget: 'Platelet Activating Factor (PAF) Antagonism & Thromboxane A2',
      clinicalExplanation: 'Ginkgolides and ajoene exert independent antiplatelet properties that amplify anticoagulant therapy, increasing spontaneous mucosal, gingival, and gastrointestinal bleeding.',
      actionableAdvice: 'Discontinue high-dose ginkgo or concentrated garlic supplements at least 14 days prior to any surgical or dental procedures.',
      source: 'NIH NCCIH Botanical Factsheet'
    });
  }

  // Minerals (Calcium, Iron, Magnesium, Zinc)
  if (genericLower.includes('ciprofloxacin') || genericLower.includes('levothyroxine') || genericLower.includes('alendronate') || genericLower.includes('doxycycline')) {
    supplementConflicts.push({
      supplementName: 'Calcium, Iron, Magnesium & Zinc Mineral Supplements',
      severity: 'CRITICAL',
      biochemicalTarget: 'Intestinal Divalent / Trivalent Cation Chelation',
      clinicalExplanation: 'Polyvalent metal ions bind the medication into insoluble ring chelates in the gastrointestinal tract, dropping oral absorption by 50% to 90% and causing therapy failure.',
      actionableAdvice: 'Separate all mineral supplements by at least 2 hours before or 4 to 6 hours after your dose.',
      source: 'NIH Office of Dietary Supplements (ODS) Health Professional Monographs'
    });
  }

  // 5. Extract Nutrient Depletion Protocols
  const depletions: DepletionProtocol[] = [];

  if (genericLower.includes('statin') || ['atorvastatin', 'simvastatin', 'rosuvastatin'].some(s => genericLower.includes(s))) {
    depletions.push({
      nutrient: 'Coenzyme Q10 (Ubiquinone / CoQ10)',
      pathwayMechanism: 'Statins competitively inhibit HMG-CoA reductase, blocking synthesis of mevalonate—an essential shared precursor for endogenous ubiquinone production.',
      recommendedSupport: 'Consider 100–200 mg daily of CoQ10 (Ubiquinol form) taken with fat-containing meals if experiencing muscle fatigue or statin-associated myalgias (SAMS).',
      evidenceSource: 'Krause and Mahan\'s Food & Nutrition Care Process'
    });
  } else if (genericLower.includes('metformin')) {
    depletions.push({
      nutrient: 'Vitamin B12 (Cobalamin) & Folate',
      pathwayMechanism: 'Metformin impairs calcium-dependent membrane action in the terminal ileum, decreasing the uptake of the intrinsic factor-vitamin B12 complex in up to 30% of long-term users.',
      recommendedSupport: 'Annual serum vitamin B12 monitoring; supplement with 1,000 mcg sublingual methylcobalamin if levels drop below 400 pg/mL.',
      evidenceSource: 'American Diabetes Association (ADA) Standards of Care'
    });
  } else if (genericLower.includes('beclomethasone') || genericLower.includes('prednisone') || genericLower.includes('corticosteroid')) {
    depletions.push({
      nutrient: 'Calcium & Vitamin D',
      pathwayMechanism: 'Glucocorticoids inhibit intestinal brush-border calcium absorption, increase renal tubular calcium wasting, and accelerate osteoclast activity.',
      recommendedSupport: 'Ensure 1,000–1,200 mg elemental calcium and 800–2,000 IU Vitamin D3 daily along with baseline bone mineral density (DEXA) monitoring.',
      evidenceSource: 'American College of Rheumatology Glucocorticoid-Induced Osteoporosis Guidelines'
    });
    depletions.push({
      nutrient: 'Potassium & Zinc',
      pathwayMechanism: 'Mineralocorticoid receptor cross-activation by corticosteroids stimulates renal potassium and zinc excretion.',
      recommendedSupport: 'Incorporate potassium-rich dietary foods (bananas, potatoes, avocados) and ensure adequate dietary zinc intake.',
      evidenceSource: 'Modern Nutrition in Health and Disease'
    });
  } else if (genericLower.includes('omeprazole') || genericLower.includes('pantoprazole') || genericLower.includes('esomeprazole')) {
    depletions.push({
      nutrient: 'Magnesium & Vitamin B12',
      pathwayMechanism: 'Hypochlorhydria impairs enzymatic cleavage of protein-bound B12 and alters intestinal TRPM6/7 channels essential for active magnesium absorption.',
      recommendedSupport: 'Routine serum magnesium testing on prolonged (>1 yr) PPI therapy; consider magnesium glycinate and oral methylcobalamin.',
      evidenceSource: 'FDA Drug Safety Communication on Hypomagnesemia'
    });
  }

  // 6. Timing Protocols & Chronotherapy
  const timingProtocols: TimingProtocol[] = [];

  // Parse Medline timing guidance
  if (drug.timingGuidance && drug.timingGuidance.length > 0) {
    for (const tg of drug.timingGuidance) {
      const lower = tg.toLowerCase();
      let badge: TimingProtocol['badge'] = 'MEAL';
      let title = 'Administration Rule';
      let rationale = 'Promotes optimal mucosal absorption and consistent therapeutic plasma levels.';

      if (lower.includes('empty stomach') || lower.includes('before a meal') || lower.includes('without food')) {
        badge = 'EMPTY_STOMACH';
        title = 'Empty Stomach Protocol';
        rationale = 'Food constituents interfere with gastrointestinal absorption or gastric emptying.';
      } else if (lower.includes('with food') || lower.includes('with meals') || lower.includes('after meals')) {
        badge = 'MEAL';
        title = 'Mealtime Administration';
        rationale = 'Food enhances bioavailability, prevents gastric mucosal irritation, or stabilizes peak-to-trough pharmacokinetic variations.';
      } else if (lower.includes('evening') || lower.includes('bedtime')) {
        badge = 'EVENING';
        title = 'Evening / Bedtime Chronotherapy';
        rationale = 'Aligns medication peak concentration with circadian physiological cycles (such as nocturnal hepatic cholesterol or acid secretion).';
      } else if (lower.includes('morning')) {
        badge = 'MORNING';
        title = 'Morning Administration';
        rationale = 'Prevents insomnia or mimics the natural diurnal endocrine spike.';
      }

      timingProtocols.push({
        title,
        instruction: tg,
        rationale,
        badge
      });
    }
  }

  // Add specific timing protocol if not already present
  if (genericLower.includes('aliskiren') && !timingProtocols.some(t => t.instruction.includes('consistently'))) {
    timingProtocols.push({
      title: 'Dietary Consistency Protocol',
      instruction: 'Aliskiren must be taken in a consistent manner with respect to meals—either always with food or always without food.',
      rationale: 'High-fat meals drop aliskiren Cmax by 71% and AUC by 85%. Switching erratically between fed and fasted states causes severe blood pressure swings.',
      badge: 'MEAL'
    });
  }

  if (genericLower.includes('alfuzosin') && !timingProtocols.some(t => t.instruction.includes('empty stomach'))) {
    timingProtocols.push({
      title: 'Post-Prandial Requirement',
      instruction: 'Take alfuzosin immediately after the same meal each day. Do NOT take on an empty stomach.',
      rationale: 'Food increases the extent of alfuzosin absorption by approximately 50%. Administering without food leads to lower bioavailability and variable vascular response.',
      badge: 'MEAL'
    });
  }

  if (genericLower.includes('exenatide')) {
    timingProtocols.push({
      title: 'Pre-Prandial Timing Window',
      instruction: 'Administer exenatide injection within the 60-minute window prior to morning and evening meals (or the two main meals of the day, approximately 6 hours apart). Never administer after a meal.',
      rationale: 'Post-prandial administration misses the gastric-emptying regulation and incretin augmentation phases, failing to blunt meal-related glycemic excursions.',
      badge: 'MEAL'
    });
    timingProtocols.push({
      title: 'Oral Medication Spacing Rule',
      instruction: 'Take oral contraceptives, oral antibiotics, and pain relievers at least 1 hour before exenatide injection.',
      rationale: 'Exenatide slows stomach emptying, which can delay the absorption and peak plasma levels of oral medications requiring rapid threshold concentrations.',
      badge: 'SPACING'
    });
  }

  if (genericLower.includes('beclomethasone')) {
    timingProtocols.push({
      title: 'Post-Administration Oral / Nasal Hygiene',
      instruction: 'Rinse mouth thoroughly with water and spit out after each inhalation dose (for oral inhalers), or blow nose gently prior to nasal application.',
      rationale: 'Rinsing clears unabsorbed corticosteroid residue from mucosal surfaces, preventing oropharyngeal candidiasis (oral thrush) and hoarseness.',
      badge: 'SPACING'
    });
  }

  // 7. Extract Related Pairwise Interactions
  const relatedPairs: RelatedPair[] = [];
  const slugClean = drug.slug.toLowerCase();

  // Find exact pairs in interaction_pairs.json
  for (const pair of pairs) {
    if (pair.substanceA?.toLowerCase() === slugClean || pair.substanceB?.toLowerCase() === slugClean ||
        pair.substanceA?.toLowerCase() === genericLower || pair.substanceB?.toLowerCase() === genericLower) {
      const otherSubstance = pair.substanceA?.toLowerCase() === slugClean || pair.substanceA?.toLowerCase() === genericLower
        ? pair.substanceB
        : pair.substanceA;

      relatedPairs.push({
        slug: pair.slug,
        title: `${drug.drugName} and ${otherSubstance.charAt(0).toUpperCase() + otherSubstance.slice(1)}`,
        substanceA: pair.substanceA,
        substanceB: pair.substanceB,
        severity: pair.priority === 1 ? 'CRITICAL' : 'HIGH'
      });
      if (relatedPairs.length >= 6) break;
    }
  }

  // If we have fewer than 4 related pairs, supplement with top common conflicts
  if (relatedPairs.length < 3) {
    if (foodConflicts.some(f => f.foodName.includes('Grapefruit'))) {
      relatedPairs.push({
        slug: `grapefruit-and-${slugClean}`,
        title: `${drug.drugName} and Grapefruit / Pomelo`,
        substanceA: slugClean,
        substanceB: 'grapefruit',
        severity: 'CRITICAL'
      });
    }
    if (foodConflicts.some(f => f.foodName.includes('Salt Substitute') || f.foodName.includes('Potassium'))) {
      relatedPairs.push({
        slug: `potassium-and-${slugClean}`,
        title: `${drug.drugName} and Potassium Salt Substitutes`,
        substanceA: slugClean,
        substanceB: 'potassium',
        severity: 'CRITICAL'
      });
    }
    if (drugConflicts.some(d => d.drugOrClass.includes('NSAID') || d.drugOrClass.includes('Aspirin'))) {
      relatedPairs.push({
        slug: `aspirin-and-${slugClean}`,
        title: `${drug.drugName} and Aspirin / NSAIDs`,
        substanceA: slugClean,
        substanceB: 'aspirin',
        severity: 'HIGH'
      });
    }
    if (textCorpus.includes('alcohol')) {
      relatedPairs.push({
        slug: `alcohol-and-${slugClean}`,
        title: `${drug.drugName} and Alcoholic Beverages`,
        substanceA: slugClean,
        substanceB: 'alcohol',
        severity: 'HIGH'
      });
    }
  }

  return {
    drugName: drug.drugName,
    genericName: drug.genericName,
    slug: drug.slug,
    medlineSlug: drug.medlineSlug,
    sourceUrl: drug.sourceUrl,
    brandNames: drug.brandNames || [],
    pharmacologicalClass,
    clinicalSummary,
    specialDietaryInstructions: drug.specialDietaryInstructions,
    hasSpecialDiet: drug.hasSpecialDiet,
    foodPrecautions: drug.foodPrecautions || [],
    timingGuidance: drug.timingGuidance || [],
    foodConflicts,
    drugConflicts,
    supplementConflicts,
    depletions,
    timingProtocols,
    relatedPairs
  };
}
