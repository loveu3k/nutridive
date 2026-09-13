import fs from 'fs';

const text = fs.readFileSync('data/raw_sources/medline_cache/meds_a611046.html', 'utf-8');
const idx = text.indexOf('What special dietary instructions should I follow?');
console.log('Index:', idx);
if (idx !== -1) {
  console.log(text.slice(idx - 200, idx + 800));
}
