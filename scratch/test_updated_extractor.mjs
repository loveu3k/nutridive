import fs from 'fs';
import path from 'path';

const cacheDir = 'data/raw_sources/medline_cache';
const files = fs.readdirSync(cacheDir);

let countWithDiet = 0;
let countActionable = 0;

for (const f of files) {
  const text = fs.readFileSync(path.join(cacheDir, f), 'utf-8');
  const title = (text.match(/<h1[^>]*>(.*?)<\/h1>/i) || [])[1] || f;
  const cleanTitle = title.replace(/<[^>]+>/g, '').trim();

  // Dietary section
  const dietMatch = text.match(/<div\s+id=["']special-dietary["'][\s\S]*?<div[^>]*class=["'][^"']*section-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  const dietText = dietMatch ? dietMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : null;

  // Precautions section
  const precMatch = text.match(/<div\s+id=["']precautions["'][\s\S]*?<div[^>]*class=["'][^"']*section-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  let precautionFoodWarnings = [];
  if (precMatch) {
    const precClean = precMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const sentences = precClean.split(/(?<=[.?!])\s+/);
    precautionFoodWarnings = sentences.filter(s => 
      /\b(grapefruit|alcohol|alcoholic|vitamin|calcium|potassium|dairy|milk|cheese|tyramine|licorice|caffeine|supplement|herb|herbal|salt substitute)\b/i.test(s)
    ).map(s => s.trim());
  }

  // How section (food timing: empty stomach / with food)
  const howMatch = text.match(/<div\s+id=["']how["'][\s\S]*?<div[^>]*class=["'][^"']*section-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  let timingFoodWarnings = [];
  if (howMatch) {
    const howClean = howMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const sentences = howClean.split(/(?<=[.?!])\s+/);
    timingFoodWarnings = sentences.filter(s => 
      /\b(empty stomach|with food|with meals|before meals|after meals|with a glass of water|with milk)\b/i.test(s)
    ).map(s => s.trim());
  }

  const isBoilerplate = !dietText || /^unless your doctor tells you otherwise,\s*continue your normal diet\.?$/i.test(dietText);

  if (dietText) countWithDiet++;
  if (!isBoilerplate || precautionFoodWarnings.length > 0 || timingFoodWarnings.length > 0) {
    countActionable++;
    console.log(`\n✅ ${cleanTitle}`);
    if (!isBoilerplate) console.log(`   [DIET] ${dietText}`);
    if (precautionFoodWarnings.length > 0) console.log(`   [PRECAUTIONS] ${precautionFoodWarnings[0]}`);
    if (timingFoodWarnings.length > 0) console.log(`   [TIMING] ${timingFoodWarnings[0]}`);
  }
}

console.log(`\n================================`);
console.log(`Total files inspected: ${files.length}`);
console.log(`Files with a Dietary section: ${countWithDiet}`);
console.log(`Files with actionable dietary/precaution/timing rules: ${countActionable}`);
