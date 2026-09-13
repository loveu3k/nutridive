import fs from 'fs';

const text = fs.readFileSync('data/raw_sources/medline_cache/meds_a611046.html', 'utf-8');
const indices = [...text.matchAll(/special-dietary/g)].map(m => m.index);
console.log('Indices of special-dietary:', indices);

for (const idx of indices) {
  console.log('--- At index:', idx);
  console.log(text.slice(idx, idx + 400));
}
