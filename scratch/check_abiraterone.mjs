import fs from 'fs';
import path from 'path';

const cacheDir = 'data/raw_sources/medline_cache';
const files = fs.readdirSync(cacheDir);

for (const f of files) {
  const text = fs.readFileSync(path.join(cacheDir, f), 'utf-8');
  if (text.includes('Abiraterone')) {
    console.log('Found Abiraterone in file:', f);
    // Print all section titles in this file
    const titles = [...text.matchAll(/<div class=["']section-title["']><h2>(.*?)<\/h2>/gi)].map(m => m[1]);
    console.log('Section titles:', titles);

    // Look for empty stomach or food in how
    const howMatch = text.match(/id=["']how["'][\s\S]*?<div class=["']section-body["']>([\s\S]*?)<\/div>/i);
    if (howMatch) {
      console.log('How section snippet:');
      console.log(howMatch[1].replace(/<[^>]+>/g, ' ').slice(0, 500));
    }
    break;
  }
}
