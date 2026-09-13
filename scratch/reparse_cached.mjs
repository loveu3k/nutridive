import fs from 'fs';
import path from 'path';

const CACHE_DIR = 'data/raw_sources/medline_cache';
const DRUG_LIST_FILE = 'data/raw_sources/medline_all_drugs.json';
const OUTPUT_FILE = 'data/rules/medline_dietary_rules.json';

const allDrugs = JSON.parse(fs.readFileSync(DRUG_LIST_FILE, 'utf-8'));
console.log(`Reparsing ${allDrugs.length} cached monographs...`);

const results = [];
let totalBrandsFound = 0;

for (const drug of allDrugs) {
  const cacheFile = path.join(CACHE_DIR, drug.slug.replace(/[\\/]/g, '_'));
  if (!fs.existsSync(cacheFile)) continue;
  const html = fs.readFileSync(cacheFile, 'utf-8');

  // Title
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  const drugTitle = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : drug.name;

  // Slug for URL (e.g. meds/a682277.html -> warfarin or a682277)
  const urlSlug = drug.name.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  // Brand Names (check brand-name-1 and brand-name-2)
  const brands = [];
  const brandSections = [...html.matchAll(/id=["']brand-name-\d+["'][\s\S]*?<div[^>]*class=["'][^"']*section-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi)];
  for (const bs of brandSections) {
    const listItems = [...bs[1].matchAll(/<li[^>]*>(.*?)<\/li>/gi)].map(m => 
      m[1].replace(/<[^>]+>/g, '').replace(/[®™]/g, '').trim()
    );
    listItems.forEach(b => {
      if (b && !brands.includes(b)) brands.push(b);
    });
  }
  if (brands.length > 0) totalBrandsFound += brands.length;

  // Dietary
  let dietaryText = null;
  const dietMatch = html.match(/<div\s+id=["']special-dietary["'][\s\S]*?<div[^>]*class=["'][^"']*section-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (dietMatch) {
    dietaryText = dietMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Precautions
  let precautionFoodWarnings = [];
  const precMatch = html.match(/<div\s+id=["']precautions["'][\s\S]*?<div[^>]*class=["'][^"']*section-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (precMatch) {
    const precClean = precMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const sentences = precClean.split(/(?<=[.?!])\s+/);
    precautionFoodWarnings = sentences.filter(s => 
      /\b(grapefruit|alcohol|alcoholic|beverage|vitamin|calcium|potassium|dairy|milk|cheese|tyramine|licorice|caffeine|supplement|herb|herbal|salt substitute)\b/i.test(s)
    ).map(s => s.trim());
  }

  // Timing
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

  results.push({
    drugName: drugTitle,
    genericName: drug.name,
    slug: urlSlug,
    medlineSlug: drug.slug,
    sourceUrl: drug.url,
    brandNames: brands,
    specialDietaryInstructions: !isBoilerplate ? dietaryText : null,
    hasSpecialDiet: !isBoilerplate,
    foodPrecautions: precautionFoodWarnings.slice(0, 4),
    timingGuidance: timingWarnings.slice(0, 3)
  });
}

console.log(`Reparsing complete! Total processed: ${results.length}`);
console.log(`Total brand names extracted: ${totalBrandsFound}`);
console.log(`Drugs with special dietary rules: ${results.filter(r => r.hasSpecialDiet).length}`);
console.log(`Drugs with brand names: ${results.filter(r => r.brandNames.length > 0).length}`);

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
console.log(`Saved to ${OUTPUT_FILE}`);
