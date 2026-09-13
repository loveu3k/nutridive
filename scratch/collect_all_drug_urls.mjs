import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://medlineplus.gov';
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
LETTERS.push('00');

async function fetchWithRetry(url, maxRetries = 5, baseDelay = 600) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Connection': 'close',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      if (res.ok) {
        return await res.text();
      }
      console.warn(`[Attempt ${attempt}] HTTP ${res.status} for ${url}`);
    } catch (e) {
      if (attempt === maxRetries) throw e;
    }
    await new Promise(r => setTimeout(r, baseDelay * attempt));
  }
  return null;
}

async function getAllDrugUrls() {
  const allDrugs = new Map(); // slug -> { name, slug, url }

  console.log('Fetching drug index pages A-Z with connection-reset-safe retries...');
  for (const letter of LETTERS) {
    const pageUrl = `${BASE_URL}/druginfo/drug_${letter === '00' ? '00' : letter + 'a'}.html`;
    try {
      const html = await fetchWithRetry(pageUrl, 4, 700);
      if (!html) {
        console.warn(`Failed to fetch ${pageUrl}`);
        continue;
      }
      const matches = [...html.matchAll(/<a\s+[^>]*href=["'](?:\.\/|\/druginfo\/)?(meds\/a\d+\.html)["'][^>]*>(.*?)<\/a>/gi)];
      let count = 0;
      for (const m of matches) {
        const slug = m[1];
        const name = m[2].replace(/<[^>]+>/g, '').trim();
        if (!allDrugs.has(slug)) {
          allDrugs.set(slug, { name, slug, url: `${BASE_URL}/druginfo/${slug}` });
          count++;
        }
      }
      console.log(`Letter ${letter}: found ${matches.length} items (${count} unique added, total: ${allDrugs.size})`);
      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      console.error(`Failed on letter ${letter} after retries:`, e.message);
    }
  }

  const drugList = Array.from(allDrugs.values());
  const outDir = path.join(process.cwd(), 'data/raw_sources');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'medline_all_drugs.json');
  fs.writeFileSync(outPath, JSON.stringify(drugList, null, 2), 'utf-8');
  console.log(`\n🎉 Success! Saved ${drugList.length} unique drug monograph URLs to ${outPath}.`);
}

getAllDrugUrls().catch(console.error);
