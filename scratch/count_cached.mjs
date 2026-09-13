import fs from 'fs';
import path from 'path';

const cacheDir = 'data/raw_sources/medline_cache';
const files = fs.readdirSync(cacheDir);

let nonNormalDietCount = 0;
let timingCount = 0;
let names = [];

for (const f of files) {
  const text = fs.readFileSync(path.join(cacheDir, f), 'utf-8');
  const title = (text.match(/<h1[^>]*>(.*?)<\/h1>/i) || [])[1] || f;
  const cleanTitle = title.replace(/<[^>]+>/g, '').trim();

  // Dietary
  const m = text.match(/id=["']special-dietary["'][\s\S]*?<div[^>]*class=["'][^"']*section-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (m) {
    const clean = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean.toLowerCase().includes('continue your normal diet')) {
      nonNormalDietCount++;
      names.push({ name: cleanTitle, rule: clean.slice(0, 100) });
    }
  }

  // Timing (empty stomach)
  const howMatch = text.match(/id=["']how["'][\s\S]*?<div[^>]*class=["'][^"']*section-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (howMatch) {
    const howClean = howMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    if (/empty stomach|before meals|with a glass of water|with food|with meals/i.test(howClean)) {
      timingCount++;
    }
  }
}

console.log(`\nCached files count: ${files.length}`);
console.log(`Actionable non-boilerplate dietary rules: ${nonNormalDietCount}`);
console.log(`Actionable food-timing rules (empty stomach/meals): ${timingCount}`);
console.log(`Sample extracted dietary rules:`);
for (const item of names.slice(0, 10)) {
  console.log(`- ${item.name}: ${item.rule}...`);
}
