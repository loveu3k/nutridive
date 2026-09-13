import fs from 'fs';
import path from 'path';

const allDrugs = JSON.parse(fs.readFileSync('data/raw_sources/medline_all_drugs.json', 'utf-8'));
console.log(`Total drugs: ${allDrugs.length}`);

// Sample 5 diverse drugs
const samples = allDrugs.slice(100, 105);
for (const drug of samples) {
  console.log(`- ${drug.name}: ${drug.url}`);
}

async function testSampleExtraction() {
  for (const drug of samples) {
    try {
      const res = await fetch(drug.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await res.text();
      
      let dietary = 'None';
      const dietIdx = html.indexOf('What special dietary instructions should I follow?');
      if (dietIdx !== -1) {
        const snippet = html.slice(dietIdx, dietIdx + 1200);
        const nextHeading = snippet.search(/<h[23]|id="if-i-forget"|id="side-effects"/i);
        const raw = nextHeading !== -1 ? snippet.slice(0, nextHeading) : snippet;
        dietary = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').replace(/^What special dietary instructions should I follow\?\s*/i, '').trim();
      }

      console.log(`\n==================\nDRUG: ${drug.name}`);
      console.log(`DIET: ${dietary.slice(0, 200)}...`);
    } catch (e) {
      console.error(`Error for ${drug.name}:`, e.message);
    }
  }
}

testSampleExtraction();
