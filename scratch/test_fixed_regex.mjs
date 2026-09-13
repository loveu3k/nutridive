import fs from 'fs';

const text = fs.readFileSync('data/raw_sources/medline_cache/meds_a611046.html', 'utf-8');
const match = text.match(/<div\s+id=["']special-dietary["'][\s\S]*?<div[^>]*class=["'][^"']*section-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
if (match) {
  console.log('Clean extracted dietary text:');
  console.log(match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
} else {
  console.log('Still not matched');
}
