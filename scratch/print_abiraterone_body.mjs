import fs from 'fs';

const text = fs.readFileSync('data/raw_sources/medline_cache/meds_a611046.html', 'utf-8');
const slice = text.slice(17592, 17592 + 1500);
console.log(slice);
