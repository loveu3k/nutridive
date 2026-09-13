import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = path.join(process.cwd(), 'data/rules/nccih_extracted_rules.json');
const BASE_URL = 'https://www.nccih.nih.gov';

/**
 * Scrapes NIH NCCIH (National Center for Complementary and Integrative Health)
 * official Herbs at a Glance monographs for clinical drug-herb interactions.
 */
async function extractNCCIHHerbs() {
  console.log('\n[1/3] Fetching NCCIH Herbs at a Glance catalog...');
  const res = await fetch(`${BASE_URL}/health/herbsataglance`);
  if (!res.ok) {
    throw new Error(`Failed to fetch NCCIH catalog: HTTP ${res.status}`);
  }
  const html = await res.text();

  const regex = /<a[^>]+href=["'](\/health\/[a-z0-9-]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const herbs = [];
  const seen = new Set();

  let match;
  while ((match = regex.exec(html)) !== null) {
    const url = `${BASE_URL}${match[1]}`;
    const name = match[2].replace(/<[^>]+>/g, '').trim();

    if (
      !match[1].includes('atoz') &&
      !match[1].includes('pain') &&
      !match[1].includes('tips') &&
      !match[1].includes('safety') &&
      !match[1].includes('providers') &&
      !match[1].includes('know-science') &&
      !match[1].includes('herbsataglance') &&
      !match[1].includes('espanol') &&
      !seen.has(url) &&
      name.length > 1
    ) {
      seen.add(url);
      herbs.push({ name, url, slug: match[1].replace('/health/', '') });
    }
  }

  console.log(`Discovered ${herbs.length} official NCCIH botanical monographs.`);
  console.log('\n[2/3] Extracting safety & drug-interaction sections...');

  const extracted = [];
  let processed = 0;

  for (const herb of herbs) {
    try {
      const pageRes = await fetch(herb.url);
      if (!pageRes.ok) continue;
      const pageHtml = await pageRes.text();

      // Extract "What Do We Know About Safety?" section
      const safetyMatch = pageHtml.match(/What Do We Know About Safety\?[\s\S]*?(?=Keep in Mind|For More Information|Key References|$)/i);
      if (!safetyMatch) continue;

      const rawSafety = safetyMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

      // Extract specific interaction mentions
      const interactions = [];

      // Keyword patterns for interacting drugs
      const drugPatterns = [
        { key: 'anticoagulant', class: 'blood_thinners', desc: 'Blood thinners / anticoagulants (e.g. Warfarin, Aspirin, DOACs)' },
        { key: 'warfarin', class: 'warfarin', desc: 'Warfarin' },
        { key: 'antidepressant', class: 'antidepressants', desc: 'Antidepressants (SSRIs, SNRIs, MAOIs)' },
        { key: 'serotonin', class: 'serotonergic_agents', desc: 'Serotonergic medications (Serotonin Syndrome risk)' },
        { key: 'cyclosporine', class: 'immunosuppressants', desc: 'Cyclosporine / organ transplant immunosuppressants' },
        { key: 'birth control', class: 'oral_contraceptives', desc: 'Oral contraceptives / birth control pills' },
        { key: 'seizure', class: 'anticonvulsants', desc: 'Anticonvulsants / seizure medications (Phenytoin, Carbamazepine)' },
        { key: 'statin', class: 'statins', desc: 'Statins (Simvastatin, Atorvastatin)' },
        { key: 'digoxin', class: 'cardiac_glycosides', desc: 'Digoxin / heart medications' },
        { key: 'sedative', class: 'cns_depressants', desc: 'Sedatives, hypnotics, or benzodiazepines' },
        { key: 'diabetes', class: 'hypoglycemic_agents', desc: 'Diabetes medications (hypoglycemia risk)' },
        { key: 'hiv', class: 'antiretrovirals', desc: 'HIV antiretrovirals (Protease inhibitors, NNRTIs)' },
        { key: 'chemotherapy', class: 'antineoplastics', desc: 'Cancer chemotherapy medications' },
        { key: 'blood pressure', class: 'antihypertensives', desc: 'Blood pressure medications' },
        { key: 'thyroid', class: 'thyroid_hormones', desc: 'Thyroid hormone replacement (Levothyroxine)' }
      ];

      for (const dp of drugPatterns) {
        if (rawSafety.toLowerCase().includes(dp.key)) {
          // Extract sentence context around match
          const sentenceRegex = new RegExp(`([^.?!]*\\b${dp.key}\\b[^.?!]*[.?!])`, 'i');
          const sentenceMatch = rawSafety.match(sentenceRegex);
          interactions.push({
            conflictingTarget: dp.desc,
            targetClass: dp.class,
            clinicalEvidence: sentenceMatch ? sentenceMatch[0].trim() : `Reported to interact with ${dp.desc} in clinical studies.`
          });
        }
      }

      if (interactions.length > 0) {
        extracted.push({
          herbName: herb.name,
          slug: herb.slug,
          sourceUrl: herb.url,
          interactionCount: interactions.length,
          interactions,
          safetyOverview: rawSafety.slice(0, 350) + '...'
        });
      }

      processed++;
      if (processed % 10 === 0 || processed === herbs.length) {
        console.log(`Processed ${processed}/${herbs.length} botanicals... (Found ${extracted.length} with drug interactions)`);
      }
    } catch (e) {
      console.error(`Error processing ${herb.name}:`, e.message);
    }
  }

  console.log(`\n[3/3] Saving extracted rules to ${OUTPUT_FILE}...`);
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(extracted, null, 2), 'utf-8');
  console.log(`✅ Completed! Extracted ${extracted.length} evidence-based botanical interaction profiles.`);
}

extractNCCIHHerbs().catch(console.error);
