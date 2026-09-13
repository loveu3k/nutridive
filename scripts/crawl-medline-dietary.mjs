import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://medlineplus.gov';
const DRUG_LIST_FILE = path.join(process.cwd(), 'data/raw_sources/medline_all_drugs.json');
const CACHE_DIR = path.join(process.cwd(), 'data/raw_sources/medline_cache');
const OUTPUT_FILE = path.join(process.cwd(), 'data/rules/medline_dietary_rules.json');

fs.mkdirSync(CACHE_DIR, { recursive: true });

async function fetchWithRetry(url, maxRetries = 3, baseDelay = 400) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await new Promise(r => setTimeout(r, baseDelay));
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Connection': 'close',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      if (res.ok) {
        return await res.text();
      }
    } catch (e) {
      if (attempt === maxRetries) return null;
      await new Promise(r => setTimeout(r, baseDelay * (attempt + 1)));
    }
  }
  return null;
}

async function getOrFetchMonograph(drug) {
  const cacheFile = path.join(CACHE_DIR, drug.slug.replace(/[\\/]/g, '_'));
  if (fs.existsSync(cacheFile)) {
    return fs.readFileSync(cacheFile, 'utf-8');
  }

  const html = await fetchWithRetry(drug.url);
  if (html) {
    fs.writeFileSync(cacheFile, html, 'utf-8');
    return html;
  }
  return null;
}

function parseMonograph(html, drug) {
  if (!html) return null;

  // Extract Generic & Brand Names
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  const drugTitle = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : drug.name;

  const brandMatch = html.match(/id=["']brand-name-1["'][\s\S]*?<div class=["']section-body["']>([\s\S]*?)<\/div>/i);
  let brands = [];
  if (brandMatch) {
    const listItems = [...brandMatch[1].matchAll(/<li[^>]*>(.*?)<\/li>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
    brands = listItems.filter(Boolean);
  }

  // Extract Dietary Section
  let dietaryText = '';
  const dietMatch = html.match(/<div\s+id=["']special-dietary["'][\s\S]*?<div[^>]*class=["'][^"']*section-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (dietMatch) {
    dietaryText = dietMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Extract Precautions mentions
  let precautionFoodWarnings = [];
  const precMatch = html.match(/<div\s+id=["']precautions["'][\s\S]*?<div[^>]*class=["'][^"']*section-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (precMatch) {
    const precClean = precMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const sentences = precClean.split(/(?<=[.?!])\s+/);
    precautionFoodWarnings = sentences.filter(s => 
      /\b(grapefruit|alcohol|alcoholic|beverage|vitamin|calcium|potassium|dairy|milk|cheese|tyramine|licorice|caffeine|supplement|herb|herbal|salt substitute)\b/i.test(s)
    ).map(s => s.trim());
  }

  // Extract Timing instructions (empty stomach / with meals)
  let timingWarnings = [];
  const howMatch = html.match(/<div\s+id=["']how["'][\s\S]*?<div[^>]*class=["'][^"']*section-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (howMatch) {
    const howClean = howMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const sentences = howClean.split(/(?<=[.?!])\s+/);
    timingWarnings = sentences.filter(s => 
      /\b(empty stomach|with food|with meals|before meals|after meals|full glass of water|with milk)\b/i.test(s)
    ).map(s => s.trim());
  }

  const isBoilerplate = !dietaryText || /^unless your doctor tells you otherwise,\s*continue your normal diet\.?$/i.test(dietaryText);
  const hasSpecificPrecautions = precautionFoodWarnings.length > 0;
  const hasSpecificTiming = timingWarnings.length > 0;

  if (!isBoilerplate || hasSpecificPrecautions || hasSpecificTiming) {
    return {
      drugName: drugTitle,
      genericName: drug.name,
      slug: drug.slug,
      sourceUrl: drug.url,
      brandNames: brands,
      specialDietaryInstructions: !isBoilerplate ? dietaryText : null,
      foodPrecautions: precautionFoodWarnings.slice(0, 3),
      timingGuidance: timingWarnings.slice(0, 2)
    };
  }

  return null;
}

async function runPipeline() {
  if (!fs.existsSync(DRUG_LIST_FILE)) {
    console.error(`Missing ${DRUG_LIST_FILE}. Please run collect_all_drug_urls.mjs first.`);
    process.exit(1);
  }

  const allDrugs = JSON.parse(fs.readFileSync(DRUG_LIST_FILE, 'utf-8'));
  console.log(`\n======================================================`);
  console.log(`[MedlinePlus Full A-Z Dietary Crawler]`);
  console.log(`Total drugs to process: ${allDrugs.length}`);
  console.log(`======================================================\n`);

  const results = [];
  const CONCURRENCY = 6;
  let processed = 0;
  let cachedCount = 0;

  for (let i = 0; i < allDrugs.length; i += CONCURRENCY) {
    const chunk = allDrugs.slice(i, i + CONCURRENCY);
    const chunkPromises = chunk.map(async (drug) => {
      const cacheFile = path.join(CACHE_DIR, drug.slug.replace(/[\\/]/g, '_'));
      if (fs.existsSync(cacheFile)) cachedCount++;
      const html = await getOrFetchMonograph(drug);
      const parsed = parseMonograph(html, drug);
      if (parsed) {
        results.push(parsed);
      }
    });

    await Promise.all(chunkPromises);
    processed += chunk.length;

    if (processed % 100 === 0 || processed === allDrugs.length) {
      console.log(`Processed ${processed}/${allDrugs.length} drugs... (Actionable rules found so far: ${results.length})`);
    }
  }

  console.log(`\n🎉 Completed MedlinePlus crawl!`);
  console.log(`Total monographs scanned: ${allDrugs.length}`);
  console.log(`Actionable clinical dietary/precaution monographs: ${results.length}`);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Saved to ${OUTPUT_FILE}`);
}

runPipeline().catch(console.error);
