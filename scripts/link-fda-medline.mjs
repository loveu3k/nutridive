import fs from 'fs';
import path from 'path';

const RULES_PATH = path.join(process.cwd(), 'data/rules/interactions.json');
const ALIASES_PATH = path.join(process.cwd(), 'data/aliases/drugs.json');
const NCCIH_PATH = path.join(process.cwd(), 'data/rules/nccih_extracted_rules.json');
const MEDLINE_PATH = path.join(process.cwd(), 'data/rules/medline_dietary_rules.json');

/**
 * Canonical Entity Alignment & Fusion Pipeline
 * Merges openFDA pharmacological drug classes, NIH NCCIH botanicals,
 * and MedlinePlus full A-Z dietary guidelines & brand names.
 */
function linkFdaMedline() {
  console.log('\n[1/4] Loading existing openFDA rules & aliases...');
  const rules = JSON.parse(fs.readFileSync(RULES_PATH, 'utf-8'));
  const aliases = JSON.parse(fs.readFileSync(ALIASES_PATH, 'utf-8'));

  const ruleMap = new Map();
  rules.forEach(r => ruleMap.set(r.classId, r));

  const aliasSet = new Set(aliases.map(a => a.keyword.toLowerCase()));

  // 1. Ingest NCCIH Botanicals
  console.log('\n[2/4] Fusing NIH NCCIH Botanicals into Canonical Interaction Graph...');
  let botanicalsAdded = 0;
  if (fs.existsSync(NCCIH_PATH)) {
    const nccih = JSON.parse(fs.readFileSync(NCCIH_PATH, 'utf-8'));

    for (const herb of nccih) {
      const herbClassId = `herb_${herb.slug.replace(/-/g, '_')}`;

      // Add alias
      const mainKeyword = herb.herbName.toLowerCase();
      if (!aliasSet.has(mainKeyword)) {
        aliasSet.add(mainKeyword);
        aliases.push({
          keyword: mainKeyword,
          classId: herbClassId,
          name: `${herb.herbName} (Botanical Extract)`
        });
        botanicalsAdded++;
      }

      // Convert NCCIH interactions to structured redFlags
      const redFlags = herb.interactions.map(i => ({
        item: i.conflictingTarget,
        reason: i.clinicalEvidence,
        severity: 'HIGH'
      }));

      if (!ruleMap.has(herbClassId)) {
        ruleMap.set(herbClassId, {
          classId: herbClassId,
          displayName: `${herb.herbName} (Herbal Supplement)`,
          recommendedSlot: 'morning',
          redFlags,
          timingRules: [],
          depletions: []
        });
      } else {
        const existing = ruleMap.get(herbClassId);
        redFlags.forEach(rf => {
          if (!existing.redFlags.some(erf => erf.item === rf.item)) {
            existing.redFlags.push(rf);
          }
        });
      }
    }
  }

  // 2. Ingest MedlinePlus Dietary Guidance into openFDA Drug Classes & Brand Names
  console.log('\n[3/4] Fusing MedlinePlus Full A-Z Dietary Instructions and Brand Names...');
  let dietaryEnriched = 0;
  let brandsAdded = 0;
  let dedicatedMedlineRulesAdded = 0;

  if (fs.existsSync(MEDLINE_PATH)) {
    const medline = JSON.parse(fs.readFileSync(MEDLINE_PATH, 'utf-8'));

    for (const med of medline) {
      const cleanGeneric = med.drugName.toLowerCase().replace(/\s+(oral\s+inhalation|injection|tablets|capsules|topical|patch|eye\s+drops|ophthalmic|otic|solution|suspension)/gi, '').trim();
      
      // Find matching drug class in openFDA rules or by alias keyword
      let targetRule = null;
      
      // Check existing aliases to see which class this drug maps to
      const existingAlias = aliases.find(a => a.keyword.toLowerCase() === cleanGeneric);
      if (existingAlias) {
        targetRule = ruleMap.get(existingAlias.classId);
      }

      // Fallback matching by name
      if (!targetRule) {
        targetRule = rules.find(r => 
          r.displayName.toLowerCase().includes(cleanGeneric) ||
          r.classId.toLowerCase().includes(cleanGeneric.replace(/\s+/g, '_'))
        );
      }

      const assignedClassId = targetRule ? targetRule.classId : `medline_${med.slug.replace(/[^\w]/g, '_')}`;

      // Ingest Brand Names into aliases
      if (med.brandNames && Array.isArray(med.brandNames)) {
        for (const brand of med.brandNames) {
          const cleanBrand = brand.toLowerCase().replace(/[®™]/g, '').trim();
          if (cleanBrand.length >= 2 && !aliasSet.has(cleanBrand)) {
            aliasSet.add(cleanBrand);
            aliases.push({
              keyword: cleanBrand,
              classId: assignedClassId,
              name: `${brand} (${med.drugName})`
            });
            brandsAdded++;
          }
        }
      }

      // Ingest Generic name if not present
      if (!aliasSet.has(cleanGeneric)) {
        aliasSet.add(cleanGeneric);
        aliases.push({
          keyword: cleanGeneric,
          classId: assignedClassId,
          name: med.drugName
        });
      }

      // Enrich Target Rule or create dedicated rule
      const dietText = med.specialDietaryInstructions;
      const precautions = med.foodPrecautions || [];
      const timings = med.timingGuidance || [];

      if (targetRule) {
        if (dietText && dietText.length > 20 && !dietText.includes('continue your normal diet')) {
          if (!targetRule.redFlags.some(rf => rf.item.includes('MedlinePlus Dietary'))) {
            targetRule.redFlags.push({
              item: 'MedlinePlus Dietary Guidance',
              reason: dietText,
              severity: 'MEDIUM'
            });
            dietaryEnriched++;
          }
        }
        if (timings.length > 0) {
          timings.forEach(t => {
            if (!targetRule.timingRules.includes(t)) {
              targetRule.timingRules.push(t);
            }
          });
        }
      } else if (dietText && dietText.length > 20 && !dietText.includes('continue your normal diet')) {
        // Create a dedicated clinical rule for this MedlinePlus drug
        const redFlags = [{
          item: 'MedlinePlus Dietary Guidance',
          reason: dietText,
          severity: 'MEDIUM'
        }];
        if (precautions.length > 0) {
          precautions.forEach(p => {
            redFlags.push({
              item: 'MedlinePlus Food Precaution',
              reason: p,
              severity: 'MEDIUM'
            });
          });
        }

        ruleMap.set(assignedClassId, {
          classId: assignedClassId,
          displayName: med.drugName,
          recommendedSlot: 'morning',
          redFlags,
          timingRules: timings,
          depletions: []
        });
        dedicatedMedlineRulesAdded++;
      }
    }
  }

  // 3. Save aligned artifacts
  console.log('\n[4/4] Writing fused clinical knowledge base...');
  const updatedRules = Array.from(ruleMap.values());
  fs.writeFileSync(RULES_PATH, JSON.stringify(updatedRules, null, 2), 'utf-8');
  fs.writeFileSync(ALIASES_PATH, JSON.stringify(aliases, null, 2), 'utf-8');

  console.log(`✅ Alignment Complete!`);
  console.log(`- Total Unified Clinical Rules: ${updatedRules.length} (Enriched ${dietaryEnriched} classes, Added ${dedicatedMedlineRulesAdded} dedicated MedlinePlus rules)`);
  console.log(`- Total Searchable Aliases: ${aliases.length} (Added ${brandsAdded} brand names, ${botanicalsAdded} NCCIH botanicals)`);
}

linkFdaMedline();
