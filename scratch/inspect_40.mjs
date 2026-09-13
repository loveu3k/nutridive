import fs from 'fs';
import path from 'path';

const cacheDir = 'data/raw_sources/medline_cache';
const files = fs.readdirSync(cacheDir);

console.log(`Analyzing ${files.length} cached files...`);
for (const f of files.slice(0, 15)) {
  const text = fs.readFileSync(path.join(cacheDir, f), 'utf-8');
  const title = (text.match(/<h1[^>]*>(.*?)<\/h1>/i) || [])[1] || f;
  const dietMatch = text.match(/id=["']special-dietary["'][\s\S]*?<div class=["']section-body["']>([\s\S]*?)<\/div>/i);
  const precMatch = text.match(/id=["']precautions["'][\s\S]*?<div class=["']section-body["']>([\s\S]*?)<\/div>/i);
  
  const dietText = dietMatch ? dietMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : 'NO_DIET_SECTION';
  const hasFoodInPrec = precMatch ? /grapefruit|alcohol|vitamin|potassium|dairy|supplement|herb/i.test(precMatch[1]) : false;

  console.log(`Drug: ${title.replace(/<[^>]+>/g, '').trim()}`);
  console.log(`  Diet Section: ${dietText.slice(0, 90)}...`);
  console.log(`  Food mentioned in precautions: ${hasFoodInPrec}`);
}
