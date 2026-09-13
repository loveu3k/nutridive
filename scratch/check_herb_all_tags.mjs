async function checkHerbAllTags() {
  const res = await fetch('https://medlineplus.gov/druginfo/herb_All.html', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  const allAs = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi)]
    .map(m => ({ href: m[1], name: m[2].replace(/<[^>]+>/g, '').trim() }))
    .filter(a => a.href.includes('nccih') || a.href.includes('natural'));
  console.log('Total NCCIH / natural links found in herb_All:', allAs.length);
  console.log(allAs.slice(0, 15));
}

checkHerbAllTags();
