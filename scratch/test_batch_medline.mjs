import fs from 'fs';
import path from 'path';

const allDrugs = JSON.parse(fs.readFileSync('data/raw_sources/medline_all_drugs.json', 'utf-8'));
const cacheDir = path.join(process.cwd(), 'data/raw_sources/medline_cache');
fs.mkdirSync(cacheDir, { recursive: true });

async function fetchCached(url, slug) {
  const cacheFile = path.join(cacheDir, slug.replace(/[\\/]/g, '_'));
  if (fs.existsSync(cacheFile)) {
    return fs.readFileSync(cacheFile, 'utf-8');
  }

  for (let i = 0; i < 3; i++) {
    try {
      await new Promise(r => setTimeout(r, 400));
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Connection': 'close'
        }
      });
      if (res.ok) {
        const text = await res.text();
        fs.writeFileSync(cacheFile, text, 'utf-8');
        return text;
      }
    } catch (e) {
      if (i === 2) throw e;
      await new Promise(r => setTimeout(r, 600 * (i + 1)));
    }
  }
  return null;
}

function parseMonograph(html, drug) {
  // Extract Brand Names
  const brandMatch = html.match(/id=["']brand-name-1["'][\s\S]*?<div class=["']section-body["']>([\s\S]*?)<\/div>/i);
  let brands = [];
  if (brandMatch) {
    const listItems = [...brandMatch[1].matchAll(/<li[^>]*>(.*?)<\/li>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
    brands = listItems.filter(Boolean);
  }

  // Extract Dietary Section
  let dietaryText = '';
  const dietMatch = html.match(/id=["']special-dietary["'][\s\S]*?<div class=["']section-body["']>([\s\S]*?)<\/div>/i);
  if (dietMatch) {
    dietaryText = dietMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Extract Precautions mentions
  let precautionFoodWarnings = [];
  const precMatch = html.match(/id=["']precautions["'][\s\S]*?<div class=["']section-body["']>([\s\S]*?)<\/div>/i);
  if (precMatch) {
    const precClean = precMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const sentences = precClean.split(/(?<=[.?!])\s+/);
    precautionFoodWarnings = sentences.filter(s => 
      /\b(grapefruit|alcohol|alcoholic|beverage|vitamin|calcium|potassium|dairy|milk|cheese|tyramine|licorice|caffeine|supplement|herb|herbal|salt substitute)\b/i.test(s)
    ).map(s => s.trim());
  }

  const isActionableDiet = dietaryText && !/^unless your doctor tells you otherwise,\s*continue your normal diet\.?$/i.test(dietaryText);
  const hasFoodPrecautions = precautionFoodWarnings.length > 0;

  if (isActionableDiet || hasFoodPrecautions) {
    return {
      drugName: drug.name,
      slug: drug.slug,
      url: drug.url,
      brandNames: brands,
      specialDietaryInstructions: dietaryText || null,
      foodPrecautions: precautionFoodWarnings.slice(0, 3)
    };
  }
  return null;
}

async function runTestBatch() {
  console.log('Testing extraction on first 40 drugs...');
  const actionable = [];
  for (let i = 0; i < 40; i++) {
    const drug = allDrugs[i];
    try {
      const html = await fetchCached(drug.url, drug.slug);
      if (!html) continue;
      const res = parseMonograph(html, drug);
      if (res) {
        actionable.push(res);
        console.log(`[+] Found actionable diet for: ${drug.name}`);
      }
    } catch (e) {
      console.error(`Error on ${drug.name}:`, e.message);
    }
  }

  console.log(`\nResults: ${actionable.length} out of 40 drugs have actionable dietary or precaution guidance!`);
  console.log('Sample extracted entries:');
  for (const a of actionable.slice(0, 5)) {
    console.log(`\n- ${a.drugName} (Brands: ${a.brandNames.join(', ')})`);
    console.log(`  Diet: ${a.specialDietaryInstructions ? a.specialDietaryInstructions.slice(0, 120) + '...' : 'None'}`);
    console.log(`  Precautions: ${a.foodPrecautions.length ? a.foodPrecautions[0].slice(0, 120) + '...' : 'None'}`);
  }
}

runTestBatch();
